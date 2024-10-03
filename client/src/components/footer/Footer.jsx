import React from "react";
import { Box, Grid, Container, Typography } from "@mui/material";
const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#1c1e29",
        padding: "13px",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography>
          Build with 💖 by{" "}
          <Typography
            component="a"
            color="primary_text"
            href="https://rocketinnovationstudio.ca/"
            target="_blank"
            sx={{
              textDecoration: "none",
              fontWeight: "bold",
              color: "#ffce6d",
            }}
          >
            @RocketInnovationStudio
          </Typography>
        </Typography>
      </Container>
    </footer>
  );
};

export default Footer;
