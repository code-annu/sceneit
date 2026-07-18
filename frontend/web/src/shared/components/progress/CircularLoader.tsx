import type React from "react";
import Box from "@mui/material/Box";
import CircularProgress, {
  circularProgressClasses,
  type CircularProgressProps,
} from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";

const LoaderContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "8px",
  width: "100%",
});

export interface CircularLoaderProps extends CircularProgressProps {
  centered?: boolean;
}

export const CircularLoader: React.FC<CircularLoaderProps> = ({
  centered = true,
  size = 40,
  thickness = 4,
  ...props
}) => {
  const loader = (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      {/* Background Track */}
      <CircularProgress
        variant="determinate"
        sx={{
          color: (theme) =>
            theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
        }}
        size={size}
        thickness={thickness}
        value={100}
      />
      {/* Spinning Active Indicator */}
      <CircularProgress
        variant="indeterminate"
        disableShrink
        sx={{
          color: (theme) => theme.palette.primary.main,
          animationDuration: "750ms",
          position: "absolute",
          left: 0,
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: "round",
          },
        }}
        size={size}
        thickness={thickness}
        {...props}
      />
    </Box>
  );

  if (centered) {
    return <LoaderContainer>{loader}</LoaderContainer>;
  }

  return loader;
};

export default CircularLoader;
