import React, { useState, useEffect, useMemo, SyntheticEvent } from "react";
import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
// import { HttpProvider } from "@polkadot/rpc-provider";
import {
  Box,
  Button,
  Typography,
  Autocomplete,
  TextField
} from "@mui/material";

import config from "./config";
import { getProsopoContract } from "./api";
import ProsopoContract from "./api/ProsopoContract";
import { getCaptchaChallenge } from "./components/captcha";
import { CaptchaWidget } from "./components/CaptchaWidget";

import "./App.css";
import { useStyles } from "./app.styles";

const networkConfig = {'endpoint': 'ws://0.0.0.0:9944'}
const network = createNetwork('', networkConfig)



const { providerApi } = config;

function App() {
  const classes = useStyles();

  const [contract, setContract] = useState<ProsopoContract | null>(null);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [account, setAccount] = useState<InjectedAccountWithMeta | null>(null);

  const [showCaptchas, setShowCaptchas] = useState(false);
  const [totalNumberOfCaptchas, setTotalNumberOfCaptchas] = useState(0);
  const [currentCaptchaIndex, setCurrentCaptchaIndex] = useState(0);

  // let currentCaptcha: ProsopoCaptcha | undefined;

  // const accounts = contract.extension?.getAllAcounts();
  const [captchaChallenge, setCaptchaChallenge] = useState<ProsopoCaptchaResponse | null>(null);

  const [captchaSolution, setCaptchaSolution] = useState<number[]>([]);

  useEffect(() => {
    providerApi.getContractAddress()
      .then(address => {
        console.log("ADDRESS", address.contractAddress);
        const contract = new ProsopoContract(address.contractAddress, abiJson, network);
        contract.creationPromise().then(() => {
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
    setCurrentCaptchaIndex(0);
  }, [captchaChallenge]);

  // useMemo(() => {
  //   currentCaptcha = captchaChallenge?.captchas[currentCaptchaIndex];
  // }, [currentCaptchaIndex]);

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

  const onAccountChange = (e: SyntheticEvent<Element, Event>, account: any) => {
    if (!contract) {
      return;
    }
    contract.extension.setAccount(account.address).then(async (account) => {
      setAccount(account);
      setCaptchaChallenge(await getCaptchaChallenge(contract, account));
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
          onChange={onAccountChange}
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
