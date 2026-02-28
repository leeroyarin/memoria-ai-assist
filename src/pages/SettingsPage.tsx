import { Volume2, Bell, Mic, User, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/errors";

const SettingRow = ({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
    {children}
  </div>
);

const SettingsPage = () => {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ variant: "destructive", title: "Error signing out", description: getUserFriendlyError(error) });
    } else {
      navigate("/auth");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customize your experience</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <SettingRow icon={Volume2} label="Voice Feedback" description="AI speaks responses aloud">
            <Switch defaultChecked />
          </SettingRow>
          <Separator />
          <SettingRow icon={Bell} label="Notifications" description="Browser push notifications">
            <Switch defaultChecked />
          </SettingRow>
          <Separator />
          <SettingRow icon={Mic} label="Default Alarm Sound" description="Buzzer">
            <Button variant="ghost" size="sm" className="text-primary text-xs">Change</Button>
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <SettingRow icon={User} label="Account" description={user?.email ?? "Not signed in"}>
            <span className="text-xs text-muted-foreground">Signed in</span>
          </SettingRow>
          <Separator />
          <div className="pt-3">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SettingsPage;
