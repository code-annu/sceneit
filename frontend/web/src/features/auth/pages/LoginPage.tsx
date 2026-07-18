import type React from "react";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";

import UsernameLoginForm from "../components/UsernameLoginForm";
import EmailLoginForm from "../components/EmailLoginForm";
import AppRoutes from "@/router/app.routes";
import { useUsernameLogin, useEmailLogin } from "../hooks/useLogin";

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const { mutate: usernameLogin, isPending: isUsernamePending } =
    useUsernameLogin();
  const { mutate: emailLogin, isPending: isEmailPending } = useEmailLogin();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 50% 50%, #151d35 0%, #090d1a 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={4} sx={{ alignItems: "center" }}>
          {/* Logo / Header */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <LocalActivityIcon sx={{ color: "primary.main", fontSize: 40 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                letterSpacing: "0.05em",
                color: "text.primary",
                display: "flex",
                alignItems: "center",
              }}
            >
              SCENE
              <Box component="span" sx={{ color: "primary.main" }}>
                IT
              </Box>
            </Typography>
          </Stack>

          <Card sx={{ width: "100%", overflow: "visible" }}>
            <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
              <Typography
                variant="h5"
                align="center"
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 4 }}
              >
                Track your favorite movies, read reviews, and build lists.
              </Typography>

              {/* Login Method Toggle Tabs */}
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  mb: 4,
                  borderBottom: 1,
                  borderColor: "rgba(255, 255, 255, 0.08)",
                  "& .MuiTab-root": {
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "0.95rem",
                  },
                }}
              >
                <Tab label="Username" id="login-tab-username" />
                <Tab label="Email" id="login-tab-email" />
              </Tabs>

              {/* Dynamic Form Render */}
              <Box>
                {activeTab === 0 ? (
                  <UsernameLoginForm
                    onSubmit={usernameLogin}
                    isPending={isUsernamePending}
                  />
                ) : (
                  <EmailLoginForm
                    onSubmit={emailLogin}
                    isPending={isEmailPending}
                  />
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Footer Link */}
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{" "}
            <Link
              component={RouterLink}
              to={AppRoutes.SIGNUP}
              sx={{
                color: "primary.main",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Sign Up
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default LoginPage;
