
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_alarm_sound TEXT DEFAULT 'buzzer',
  voice_feedback_enabled BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create memories table
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memories" ON public.memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON public.memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON public.memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON public.memories FOR DELETE USING (auth.uid() = user_id);

-- Create reminders table
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  memory_id UUID REFERENCES public.memories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'time',
  trigger_time TIMESTAMPTZ,
  trigger_context TEXT,
  alarm_sound TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Validation trigger for type
CREATE OR REPLACE FUNCTION public.validate_reminder_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type NOT IN ('time', 'activity') THEN
    RAISE EXCEPTION 'type must be time or activity';
  END IF;
  IF NEW.priority NOT IN ('normal', 'high') THEN
    RAISE EXCEPTION 'priority must be normal or high';
  END IF;
  IF NEW.status NOT IN ('pending', 'done', 'dismissed') THEN
    RAISE EXCEPTION 'status must be pending, done, or dismissed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_reminder_before_insert_update
  BEFORE INSERT OR UPDATE ON public.reminders
  FOR EACH ROW EXECUTE FUNCTION public.validate_reminder_type();

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders" ON public.reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON public.reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders" ON public.reminders FOR DELETE USING (auth.uid() = user_id);
