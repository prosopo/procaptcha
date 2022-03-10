import React, {
  useState,
  useEffect,
  ChangeEventHandler,
  SyntheticEvent
} from "react";
import "./App.css";
import { extensionTest } from "./api";
import ProsopoContract from "./api/ProsopoContract";
import { HttpProvider } from "@polkadot/rpc-provider";
import { prosopoMiddleware } from "@prosopo/provider/src/api";
import { Environment } from "@prosopo/provider/src/env";
import {
  Avatar,
  Box,
  Button,
  Typography,
  Autocomplete,
  TextField
} from "@mui/material";
import { useStyles } from "./app.styles";

import CaptchaPuzzle from "./mockedResponses/captchaPuzzle.json";

const contract = new ProsopoContract(
  new HttpProvider(),
  "5Guo3SqQguAJERaV1fsCFCyVDWp4AkXCBzYFr84QvESrtiyU"
);

function App() {
  const [account, setAccount] = useState(null);
  const classes = useStyles();
  const [showCaptchas, setShowCaptchas] = useState(false);
  const [totalNumberOfCaptchas, setTotalNumberOfCaptchas] = useState(0);
  const [currentCaptchaIndex, setCurrentCaptchaIndex] = useState(0);

  const accounts = contract.extension?.getAllAcounts();
  const captchas = CaptchaPuzzle.captchas;

  useEffect(() => {
    setTotalNumberOfCaptchas(captchas.length);
  }, [captchas]);

  const toggleShowCaptchas = () => {
    setShowCaptchas(!showCaptchas);
    setAccount(null);
  };

  const cancelCaptchasHandler = () => {
    setShowCaptchas(false);
    setAccount(null);
    setCurrentCaptchaIndex(0);
  };

  const submitCaptchaHandler = () => {
    if (currentCaptchaIndex === totalNumberOfCaptchas - 1) {
      setShowCaptchas(!showCaptchas);
      setAccount(null);
      setCurrentCaptchaIndex(0);
    } else {
      setCurrentCaptchaIndex(currentCaptchaIndex + 1);
    }
  };

  // useEffect(() => {
  //   contract
  //     .creationPromise()
  //     .then(() => {
  //       setAccount(contract.extension.getAccount());
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // }, []);

  // if (!account) {
  //   return null;
  // }

  const accountOnChange = (e: SyntheticEvent<Element, Event>, account: any) => {
    contract.extension
      .setAccount(account.address)
      .then(({ address }) => setAccount(address));
  };

  // const onClick = () => {
  //   const provider = contract.getRandomProvider();
  // };

  return (
    <Box className={classes.root}>
      {showCaptchas && !account && (
        <Autocomplete
          disablePortal
          id="select-accounts"
          options={accounts}
          value={account}
          isOptionEqualToValue={(option, value) =>
            option.address === value.address
          }
          onChange={accountOnChange}
          sx={{ width: 550 }}
          getOptionLabel={(option: any) =>
            `${option.meta.name}\n${option.address}`
          }
          renderInput={(params) => (
            <TextField {...params} label="Select account" />
          )}
        />
      )}

      {showCaptchas && account && (
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

            <Box className={classes.dotsContainer}>
              {Array.from(Array(totalNumberOfCaptchas).keys()).map((item) => {
                return (
                  <Box
                    className={classes.dot}
                    style={{
                      backgroundColor:
                        currentCaptchaIndex === item ? "#CFCFCF" : "#FFFFFF"
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          <Box className={classes.captchasFooter}>
            <Button onClick={cancelCaptchasHandler} variant="text">
              Cancel
            </Button>
            <Button onClick={submitCaptchaHandler} variant="contained">
              {currentCaptchaIndex === totalNumberOfCaptchas - 1
                ? "Submit"
                : "Next"}
            </Button>
          </Box>
        </Box>
      )}

      {!showCaptchas && !account && (
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
}

export default App;
