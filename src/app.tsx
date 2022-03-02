import React, { useState } from "react";
import { Avatar, Box, Button, Typography } from "@mui/material";

import { useStyles } from "./app.styles";

const App = () => {
  const classes = useStyles();
  const [showCaptchas, setShowCaptchas] = useState(false);

  const toggleShowCaptchas = () => {
    setShowCaptchas(!showCaptchas);
  };

  return (
    <Box className={classes.root}>
      {showCaptchas ? (
        <Box className={classes.captchasContainer}>
          <Box className={classes.captchasHeader}>
            <Typography className={classes.captchasHeaderLabel}>
              Select all images with a bus.
            </Typography>
          </Box>

          <Box className={classes.captchasBody}>
            {Array.from(Array(9).keys()).map((item, index) => {
              return (
                <Avatar
                  key={index}
                  src="/"
                  variant="square"
                  className={classes.captchaItem}
                />
              );
            })}
          </Box>

          <Box className={classes.captchasFooter}>
            <Button onClick={toggleShowCaptchas} variant="text">
              Cancel
            </Button>
            <Button onClick={toggleShowCaptchas} variant="contained">
              Submit
            </Button>
          </Box>
        </Box>
      ) : (
        <Button
          onClick={toggleShowCaptchas}
          classes={{ root: classes.iAmHumanButton }}
        >
          <Typography className={classes.iAmHumanButtonLabel}>
            I am human
          </Typography>
        </Button>
      )}
    </Box>
  );
};

export default App;
