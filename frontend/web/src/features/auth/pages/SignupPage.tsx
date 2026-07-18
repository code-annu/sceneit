import type React from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";

import SignupForm from "../components/SignupForm";
import AppRoutes from "@/router/app.routes";
import { useSignup } from "../hooks/useSignup";

export const SignupPage: React.FC = () => {
  const { mutate: signup, isPending } = useSignup();
  console.log("Signup page is rendered again.");

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
                Create Account
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ mb: 4 }}
              >
                Join Sceneit to start rating and sharing your favorite movies.
              </Typography>

              <SignupForm onSubmit={signup} isPending={isPending} />
            </CardContent>
          </Card>

          {/* Footer Link */}
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to={AppRoutes.LOGIN}
              sx={{
                color: "primary.main",
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Log In
            </Link>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default SignupPage;
