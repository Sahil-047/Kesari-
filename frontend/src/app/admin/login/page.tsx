"use client";

import { LockOutlined, MailOutlined } from "@ant-design/icons";
import logoDark from "@/assets/brand/kesari-logo.png";
import { useAuth } from "@/components/admin/AuthProvider";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import Image from "next/image";
import { useState } from "react";

type Credentials = { email: string; password: string };

/** Intrinsic logo is 370×250 — keep one locked size so it never jumps. */
const LOGO_W = 72;
const LOGO_H = 49;

const LOGIN_IMAGE = "/images/hero-wedding.jpg";

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
    <div className="studio-login">
      <aside className="studio-login-panel" aria-hidden>
        <Image
          src={LOGIN_IMAGE}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="studio-login-photo"
        />
        <div className="studio-login-panel-scrim" />
        <div className="studio-login-panel-copy">
          <p className="studio-login-panel-title studio-display">
            Same traditions.
            <br />
            New stories.
          </p>
          <p className="studio-login-panel-text">
            Change the site&apos;s words, photos and films, add pieces to the catalogue, and answer every note written
            to the house.
          </p>
        </div>
      </aside>

      <div className="studio-login-form-wrap">
        <Card variant="borderless" className="studio-login-card" styles={{ body: { padding: 0 } }}>
          <div className="studio-login-card-media">
            <Image
              src={LOGIN_IMAGE}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 400px, 92vw"
              className="studio-login-photo"
            />
          </div>
          <div className="studio-login-card-inner">
            <div className="studio-login-brand">
              <Image
                src={logoDark}
                alt="Kesari"
                width={LOGO_W}
                height={LOGO_H}
                priority
                className="studio-login-logo"
              />
              <div className="studio-login-brand-copy">
                <Typography.Title level={1} className="studio-display studio-login-heading">
                  Welcome back
                </Typography.Title>
                <Typography.Paragraph type="secondary" className="studio-login-sub">
                  Sign in to Studio.
                </Typography.Paragraph>
              </div>
            </div>

            {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

            <Form<Credentials> layout="vertical" requiredMark={false} onFinish={onFinish} disabled={busy}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, type: "email", message: "Enter your email" }]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="you@kesari.in"
                  autoComplete="username"
                  size="large"
                  inputMode="email"
                />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Enter your password" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Your password"
                  autoComplete="current-password"
                  size="large"
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={busy} className="studio-login-submit">
                Sign in
              </Button>
            </Form>

            <Typography.Paragraph type="secondary" className="studio-login-foot">
              No account yet? Ask an admin to add you under Team.
            </Typography.Paragraph>
          </div>
        </Card>
      </div>
    </div>
  );
}
