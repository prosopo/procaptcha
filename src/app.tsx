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

const contract = new ProsopoContract(
  new HttpProvider(),
  "5Guo3SqQguAJERaV1fsCFCyVDWp4AkXCBzYFr84QvESrtiyU"
);

function App() {
  const [account, setAccount] = useState(null);
  const classes = useStyles();
  const [showCaptchas, setShowCaptchas] = useState(false);

  const toggleShowCaptchas = () => {
    setShowCaptchas(!showCaptchas);
    setAccount(null);
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

  const accounts = contract.extension?.getAllAcounts();

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
