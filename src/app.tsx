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

import ProsopoContract from "./api/ProsopoContract";
import Extension from "./api/Extension";

import { getExtension } from "./modules/extension";
import { getProsopoContract } from "./modules/contract";
import ProCaptcha from "./modules/ProCaptcha";
import { CaptchaWidget } from "./components/CaptchaWidget";

import "./App.css";
import { useStyles } from "./app.styles";

const { providerApi } = config;

function App() {

  const classes = useStyles();

  const [contractAddress, setContractAddress] = useState<string>('');
  const [contract, setContract] = useState<ProsopoContract | null>(null);
  const [extension, setExtension] = useState<Extension | null>(null);

  // const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [account, setAccount] = useState<InjectedAccountWithMeta | null>(null);

  const [showCaptchas, setShowCaptchas] = useState(false);
  const [totalCaptchas, setTotalCaptchas] = useState(0);
  const [currentCaptchaIndex, setCurrentCaptchaIndex] = useState(0);

  // let currentCaptcha: ProsopoCaptcha | undefined;
  // const accounts = contract.extension?.getAllAcounts();

  const [provider, setProvider] = useState<ProsopoRandomProviderResponse | null>(null);

  const [captchaChallenge, setCaptchaChallenge] = useState<ProsopoCaptchaResponse | null>(null);
  const [captchaSolution, setCaptchaSolution] = useState<number[]>([]);

  // const proCaptcha = useMemo((): ProCaptcha | null => {
  //   if (contract && account) {
  //     return new ProCaptcha(contract, account);
  //   }
  //   return null;
  // }, [contract, account]);

  useEffect(() => {
    
      // .then(address => {
        // console.log("ADDRESS", address.contractAddress);
        Promise.all([providerApi.getContractAddress(), getExtension()])
        // Promise.all([getProsopoContract(address.contractAddress), getExtension()])
          .then(result => {
              const [_contractAddress, _extension] = result;

              console.log("CONTRACT", _contractAddress.contractAddress);

              setContractAddress(_contractAddress.contractAddress);
              // setContract(_contract);
              setExtension(_extension);
              // setAccounts(_extension.getAllAcounts());
          })
          .catch(err => { 
              console.error(err);
          });
      // })
      // .catch(err => {
      //   console.error(err);
      // });

  }, []);

  useEffect(() => {
    setTotalCaptchas(captchaChallenge?.captchas.length ?? 0);
    setCurrentCaptchaIndex(0);
  }, [captchaChallenge]);

  useEffect(() => {
    console.log("CLICK SOLUTION", captchaSolution);
  }, [captchaSolution]);

  const toggleShowCaptchas = () => {
    setShowCaptchas(!showCaptchas);
    setAccount(null);
  };

  const cancelCaptchas = () => {
    setCaptchaChallenge(null);
    setShowCaptchas(false);
    setAccount(null);
    setCurrentCaptchaIndex(0);
  };

  const submitCaptchaHandler = async () => {
    if (!extension || !contract || !captchaChallenge) {
      // TODO throw error
      return;
    }

    const signer = extension.getInjected().signer;

    console.log("SIGNER", signer);

    const proCaptcha = new ProCaptcha(contract);
    const currentCaptcha = captchaChallenge.captchas[currentCaptchaIndex];
    const { captchaId, datasetId } = currentCaptcha.captcha;
    const solved = await proCaptcha.solveCaptchaChallenge(signer, provider.providerId, captchaId, datasetId, captchaSolution);

    console.log("CAPTCHA SOLVED", solved);

    // console.log("dappUserCommit HUMAN", solved.toHuman());

    const nextCaptchaIndex = currentCaptchaIndex + 1;

    if (nextCaptchaIndex < totalCaptchas) {
      setCurrentCaptchaIndex(nextCaptchaIndex);
    } else {
      cancelCaptchas();
    }

  };


  const onAccountChange = (e: SyntheticEvent<Element, Event>, account: any) => {
    if (!extension || !contractAddress) {
      return;
    }
    extension.setAccount(account.address).then(async (account) => {
      setAccount(account);
      const _contract = await getProsopoContract(contractAddress, account);
      setContract(_contract);
      const _provider = await _contract.getRandomProvider();
      setProvider(_provider);
      
      console.log("SET PROVIDER", _provider);

      // return;

      const proCaptcha = new ProCaptcha(_contract);
      setCaptchaChallenge(await proCaptcha.getCaptchaChallenge(_provider));
    });
  };

  const onCaptchaSolutionClick = (index: number) => {
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
          options={extension?.getAllAcounts() || []}
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
              {Array.from(Array(totalCaptchas).keys()).map((item, index) => {
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
            <Button onClick={cancelCaptchas} variant="text">
              Cancel
            </Button>
            <Button onClick={submitCaptchaHandler} variant="contained">
              {currentCaptchaIndex === totalCaptchas - 1
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
