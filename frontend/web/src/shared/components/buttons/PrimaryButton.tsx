import type React from "react";
import Button, { type ButtonProps } from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
  padding: "10px 24px",
  borderRadius: "8px",
  textTransform: "none",
  fontSize: "0.95rem",
  boxShadow: "0px 4px 12px rgba(250, 204, 21, 0.15)",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    backgroundColor: "#F59E0B", // Slightly darker amber/yellow
    boxShadow: "0px 6px 18px rgba(250, 204, 21, 0.3)",
    transform: "translateY(-1px)",
  },
  "&:active": {
    transform: "translateY(1px)",
  },
  "&.Mui-disabled": {
    backgroundColor: "rgba(250, 204, 21, 0.2)",
    color: "rgba(255, 255, 255, 0.3)",
    boxShadow: "none",
  },
}));

export interface PrimaryButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, ...props }) => {
  return (
    <StyledButton {...props}>
      {children}
    </StyledButton>
  );
};

export default PrimaryButton;
