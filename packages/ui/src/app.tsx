import React, { useState, useEffect, useMemo, SyntheticEvent } from "react";
import "./App.css";
import ProsopoContract from "./api/ProsopoContract";
import { getProsopoContract } from "./api";
import ProviderApi from "./api/providerApi";
import { HttpProvider } from "@polkadot/rpc-provider";
import {
  Avatar,
  Box,
  Button,
  Typography,
  Autocomplete,
  TextField
} from "@mui/material";
import { useStyles } from "./app.styles";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

// import CaptchaPuzzle from "./mockedResponses/captchaPuzzle.json";

const providerApi = new ProviderApi("http://localhost:3000", "/v1/prosopo");

// TODO component
function CaptchaWidget({ challenge, solution, solutionClickEvent}: 
  {challenge: ProsopoCaptcha, solution: number[], solutionClickEvent: (index: number) => void}) {
  // TODO challenge.items
  const items = Array.from(Array(9).keys());

  const classes = useStyles();

  return (
    <>
      {items.map((item, index) => <Avatar
        key={index}
        src="/" // TODO challenge.items[].path...
        variant="square"
        className={classes.captchaItem + " " + (solution.includes(index) ? " selected" : "")}
        onClick={() => solutionClickEvent(index)} />
      )}
    </>
  );
}

function App() {
  const classes = useStyles();

  const [contract, setContract] = useState<ProsopoContract | null>(null);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [account, setAccount] = useState<InjectedAccountWithMeta | null>(null);

  const [showCaptchas, setShowCaptchas] = useState(false);
  const [totalNumberOfCaptchas, setTotalNumberOfCaptchas] = useState(0);
  const [currentCaptchaIndex, setCurrentCaptchaIndex] = useState(0);

  // const accounts = contract.extension?.getAllAcounts();
  const [captchaChallenge, setCaptchaChallenge] = useState<ProsopoCaptchaResponse | null>(null);

  const [captchaSolution, setCaptchaSolution] = useState<number[]>([]);


  useEffect(() => {
    providerApi.getContractAddress()
      .then(address => {
        console.log("ADDRESS", address.contractAddress);
        getProsopoContract(address.contractAddress)
          .then(contract => {
              console.log("CONTRACT", contract);
              setContract(contract);
              setAccounts(contract.extension.getAllAcounts());
          })
          .catch(err => { 
              console.error(err);
          });
      })
      .catch(err => {
        console.error(err);
      });

  }, []);

  useEffect(() => {
    setTotalNumberOfCaptchas(captchaChallenge?.captchas.length ?? 0);
  }, [captchaChallenge]);

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
    if (!contract) {
      return;
    }
    contract.extension.setAccount(account.address).then(async (account) => {
      setAccount(account);
      console.log("ACCOUNT", account.address);
      const randomProvider = await contract.getRandomProvider(account.address);
      console.log("PROVIDER", randomProvider);
      if (!randomProvider) {
        throw new Error("No random provider");
      }
      const captchaPuzzle: ProsopoCaptchaResponse = await providerApi.getCaptchaChallenge(randomProvider);
      console.log("CAPTCHA", captchaPuzzle);
      setCaptchaChallenge(captchaPuzzle);
    });
  };

  const onCaptchaSolutionClick = (index: number) => {
    console.log("CLICK SOLUTION", index);
    if (captchaSolution.includes(index)) {
      setCaptchaSolution(captchaSolution.filter(item => item !== index));
    } else {
      setCaptchaSolution([...captchaSolution, index]);
    }
  }

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

            {captchaChallenge && <CaptchaWidget challenge={captchaChallenge[currentCaptchaIndex]} solution={captchaSolution} solutionClickEvent={onCaptchaSolutionClick} />}

            <Box className={classes.dotsContainer}>
              {Array.from(Array(totalNumberOfCaptchas).keys()).map((item, index) => {
                return (
                  <Box
                    key={index}
                    className={classes.dot}
                    style={{
                      backgroundColor: currentCaptchaIndex === item ? "#CFCFCF" : "#FFFFFF"
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
