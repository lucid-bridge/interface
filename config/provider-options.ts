import * as UAuthWeb3Modal from "@uauth/web3modal";
import UAuthSPA from "@uauth/js";
import { type IProviderOptions } from "web3modal";

export const uauthOptions: UAuthWeb3Modal.IUAuthOptions = {
  clientID: process.env.NEXT_PUBLIC_UAUTH_CLIENT_ID!,
  redirectUri: process.env.NEXT_PUBLIC_UAUTH_REDIRECT_URI!,

  scope: "openid wallet",
};

export const providerOptions: IProviderOptions = {
  "custom-uauth": {
    display: UAuthWeb3Modal.display,
    connector: UAuthWeb3Modal.connector,
    package: UAuthSPA,
    options: uauthOptions,
  },
};
