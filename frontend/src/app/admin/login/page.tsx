"use client";

import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAuth } from "@/components/admin/AuthProvider";
import { Alert, Avatar, Button, Card, Flex, Form, Input, Typography } from "antd";
import Image from "next/image";
import { useState } from "react";

type Credentials = { email: string; password: string };

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFinish = async ({ email, password }: Credentials) => {
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", minHeight: "100vh" }} className="lg:grid-cols-[1fr_minmax(460px,0.8fr)]">
      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-[#0c0a09] lg:block">
        <Image
          src="/images/hero-wedding.jpg"
          alt=""
          fill
          priority
          sizes="55vw"
          className="object-cover object-[50%_25%] opacity-60 grayscale"
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Flex align="center" gap={12}>
            <Avatar
              shape="square"
              size={32}
              className="studio-display"
              style={{ background: "#fff", color: "#a16207", fontWeight: 600, fontSize: 16, borderRadius: 6 }}
            >
              K
            </Avatar>
            <Typography.Text strong style={{ color: "#fff", fontSize: 15 }}>
              Kesari Studio
            </Typography.Text>
          </Flex>
          <div style={{ maxWidth: 440 }}>
            <Typography.Title className="studio-display" style={{ color: "#fff", margin: 0, fontSize: 48, lineHeight: 1.08 }}>
              Same traditions.
              <br />
              New stories.
            </Typography.Title>
            <Typography.Paragraph style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, marginTop: 16 }}>
              Change the site&apos;s words, photos and films, add pieces to the catalogue, and answer every note
              written to the house.
            </Typography.Paragraph>
          </div>
        </div>
      </div>

      {/* Form side */}
      <Flex align="center" justify="center" style={{ padding: 24, background: "#fff" }}>
        <Card variant="borderless" style={{ width: "100%", maxWidth: 380, boxShadow: "none" }} styles={{ body: { padding: 8 } }}>
          <Typography.Title level={1} className="studio-display" style={{ marginTop: 0, marginBottom: 6, fontSize: 32 }}>
            Welcome back
          </Typography.Title>
          <Typography.Paragraph type="secondary">Manage the Kesari website.</Typography.Paragraph>

          {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}

          <Form<Credentials> layout="vertical" requiredMark={false} onFinish={onFinish} disabled={busy}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: "email", message: "Enter your email" }]}
            >
              <Input prefix={<MailOutlined />} placeholder="you@kesari.in" autoComplete="username" size="large" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true, message: "Enter your password" }]}>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Your password"
                autoComplete="current-password"
                size="large"
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={busy}>
              Sign in
            </Button>
          </Form>

          <Typography.Paragraph type="secondary" style={{ textAlign: "center", marginTop: 24, marginBottom: 0 }}>
            No account yet? Ask an admin to add you under Team.
          </Typography.Paragraph>
        </Card>
      </Flex>
    </div>
  );
}
