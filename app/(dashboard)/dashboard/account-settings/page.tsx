'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Settings, Shield, User } from 'lucide-react';
import { useActionState } from 'react';
import { updateProfile, updatePassword, deleteAccount } from '@/app/(login)/actions';
import { User as UserType } from '@/lib/auth/middleware';
import useSWR from 'swr';
import { Suspense } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ActionState = {
  fullName?: FormDataEntryValue | null;
  error?: string;
  success?: string;
};

type PasswordState = {
  currentPassword?: FormDataEntryValue | null;
  newPassword?: FormDataEntryValue | null;
  confirmPassword?: FormDataEntryValue | null;
  error?: string;
  success?: string;
};

type DeleteState = {
  password?: FormDataEntryValue | null;
  error?: string;
  success?: string;
};

type AccountFormProps = {
  state: ActionState;
  fullNameValue?: string;
  emailValue?: string;
};

function AccountForm({
  state,
  fullNameValue = '',
  emailValue = ''
}: AccountFormProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Full Name
        </Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="Enter your full name"
          defaultValue={state.fullName?.toString() || fullNameValue}
          required
          className="border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          defaultValue={emailValue}
          disabled
          className="border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed. Contact support if you need to update your email address.
        </p>
      </div>
    </>
  );
}

function AccountFormWithData({ state }: { state: ActionState }) {
  const { data: user } = useSWR<UserType>('/api/user', fetcher);
  return (
    <AccountForm
      state={state}
      fullNameValue={user?.name ?? ''}
      emailValue={user?.email ?? ''}
    />
  );
}

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    (prevState: ActionState, formData: FormData) => updateProfile(formData),
    { error: '', success: '' }
  );

  const [passwordState, passwordAction, isPasswordPending] = useActionState<
    PasswordState,
    FormData
  >((prevState: PasswordState, formData: FormData) => updatePassword(formData), { error: '', success: '' });

  const [deleteState, deleteAction, isDeletePending] = useActionState<
    DeleteState,
    FormData
  >((prevState: DeleteState, formData: FormData) => deleteAccount(formData), { error: '', success: '' });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information, security settings, and preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Update your personal information and account details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" action={formAction}>
                <Suspense fallback={<AccountForm state={state} />}>
                  <AccountFormWithData state={state} />
                </Suspense>
                {state.error && (
                  <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    {state.error}
                  </p>
                )}
                {state.success && (
                  <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-md p-3">
                    {state.success}
                  </p>
                )}
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Account
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" action={passwordAction}>
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-sm font-medium">
                    Current Password
                  </Label>
                  <Input
                    id="current-password"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                    minLength={8}
                    maxLength={100}
                    defaultValue={passwordState.currentPassword?.toString()}
                    className="border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={100}
                    defaultValue={passwordState.newPassword?.toString()}
                    className="border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={100}
                    defaultValue={passwordState.confirmPassword?.toString()}
                    className="border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {passwordState.error && (
                  <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    {passwordState.error}
                  </p>
                )}
                {passwordState.success && (
                  <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-md p-3">
                    {passwordState.success}
                  </p>
                )}
                <Button type="submit" disabled={isPasswordPending}>
                  {isPasswordPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Shield className="h-5 w-5" />
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <h4 className="font-medium text-destructive mb-2">Warning</h4>
                  <p className="text-sm text-muted-foreground">
                    Deleting your account will permanently remove all your data, including:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Your profile information</li>
                    <li>• Air club memberships</li>
                    <li>• All associated data</li>
                    <li>• Subscription information</li>
                  </ul>
                </div>
                <form className="space-y-4" action={deleteAction}>
                  <div className="space-y-2">
                    <Label htmlFor="delete-password" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="delete-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="Enter your password to confirm"
                      className="border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {deleteState.error && (
                    <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-md p-3">
                      {deleteState.error}
                    </p>
                  )}
                  {deleteState.success && (
                    <p className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-md p-3">
                      {deleteState.success}
                    </p>
                  )}
                  <Button 
                    type="submit" 
                    variant="destructive" 
                    disabled={isDeletePending}
                  >
                    {isDeletePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Account
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 