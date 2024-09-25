import * as React from 'react';
import { IMobileRegistryEntry, IQRCodeModalOptions, IAppRegistry } from '@walletconnect/types';
import {
    isMobile,
    formatIOSMobile,
    saveMobileLinkInfo,
    getMobileLinkRegistry,
    getWalletRegistryUrl,
    formatMobileRegistry,
} from '@walletconnect/browser-utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Header from './Header';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import QRCodeDisplay from './QRCodeDisplay';

import { TextMap } from '../types';
import { KLIP_CLOSE_BUTTON_ID, KLIP_MODAL_ID } from '../constants';

interface ModalProps {
    text: TextMap;
    uri: string;
    onClose: any;
    qrcodeModalOptions?: IQRCodeModalOptions;
}

function Modal(props: ModalProps) {
    const mobile = isMobile();

    const [loading, setLoading] = React.useState(false);
    const [fetched, setFetched] = React.useState(false);
    const [displayQRCode, setDisplayQRCode] = React.useState(!mobile);
    const [hasSingleLink, setHasSingleLink] = React.useState(false);
    const [singleLinkHref, setSingleLinkHref] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [links, setLinks] = React.useState<IMobileRegistryEntry[]>([]);

    const displayProps = {
        mobile,
        text: props.text,
        uri: props.uri,
        qrcodeModalOptions: props.qrcodeModalOptions,
    };

    const getLinksIfNeeded = () => {
        React.useEffect(() => {
            const initLinks = async () => {
                if (fetched || loading || links.length > 0) {
                    return;
                }
                setLoading(true);
                try {
                    const url =
                        props.qrcodeModalOptions && props.qrcodeModalOptions.registryUrl
                            ? props.qrcodeModalOptions.registryUrl
                            : getWalletRegistryUrl();
                    const registryResponse = await fetch(url);
                    const registry = (await registryResponse.json()).listings as IAppRegistry;
                    const platform = mobile ? 'mobile' : 'desktop';
                    const _links = getMobileLinkRegistry(formatMobileRegistry(registry, platform), []);
                    setLoading(false);
                    setFetched(true);
                    setErrorMessage(!_links.length ? props.text.no_supported_wallets : '');
                    setLinks(_links);
                    const hasSingleLink = _links.length === 1;
                    if (hasSingleLink) {
                        setSingleLinkHref(formatIOSMobile(props.uri, _links[0]));
                        setDisplayQRCode(true);
                    }
                    setHasSingleLink(hasSingleLink);
                } catch (e) {
                    setLoading(false);
                    setFetched(true);
                    setErrorMessage(props.text.something_went_wrong);
                    console.error(e); // eslint-disable-line no-console
                }
            };
            initLinks();
        });
    };

    getLinksIfNeeded();
    const colorMode = localStorage.getItem('colorMode') === 'dark' ? 'klip-qrcode_dark' : '';
    return (
        <div id={KLIP_MODAL_ID} className={`klip-qrcode__base animated fadeIn ${colorMode}`}>
            <div className="klip-modal__base">
                <div className="klip-modal__header">
                    <div className="klip-modal__close__wrapper" onClick={props.onClose}>
                        <div id={KLIP_CLOSE_BUTTON_ID} className="klip-modal__close__icon">
                            <div className="klip-modal__close__line1"></div>
                            <div className="klip-modal__close__line2"></div>
                        </div>
                    </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
                    <use
                        href="#paint0_linear_609_1253_circle"
                        stroke="url(#paint0_linear_609_1253)"
                        stroke-linecap="round"
                    >
                        <animateTransform
                            attributeName="transform"
                            attributeType="XML"
                            type="rotate"
                            from="360 28 28"
                            to="0 28 28"
                            dur="2.5s"
                            repeatCount="indefinite"
                        />
                    </use>
                    <defs>
                        <path
                            id="paint0_linear_609_1253_circle"
                            d="M36.6385 5.60895C39.579 6.7434 42.2672 8.44592 44.5497 10.6193C46.8322 12.7927 48.6643 15.3943 49.9414 18.2757C51.2184 21.1571 51.9154 24.2619 51.9926 27.4126C52.0698 30.5634 51.5256 33.6985 50.3911 36.639C49.2567 39.5795 47.5542 42.2677 45.3808 44.5502C43.2074 46.8327 40.6058 48.6648 37.7244 49.9419C34.843 51.2189 31.7382 51.9159 28.5875 51.9931C25.4367 52.0703 22.3015 51.5261 19.3611 50.3916C16.4206 49.2572 13.7324 47.5547 11.4499 45.3813C9.16735 43.2079 7.33527 40.6063 6.05822 37.7249C4.78117 34.8435 4.08416 31.7387 4.00699 28.588C3.92982 25.4372 4.474 22.3021 5.60845 19.3616C6.7429 16.4211 8.44542 13.7329 10.6188 11.4504C12.7922 9.16786 15.3938 7.33578 18.2752 6.05873C21.1566 4.78168 24.2614 4.08467 27.4121 4.0075C30.5629 3.93032 33.698 4.4745 36.6385 5.60895L36.6385 5.60895Z"
                            stroke-width="8"
                        />
                        <linearGradient
                            id="paint0_linear_609_1253"
                            x1="5.60845"
                            y1="19.3616"
                            x2="50.3911"
                            y2="36.639"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stop-color="white" />
                            <stop offset="1" stop-color="#9BE15D" />
                        </linearGradient>
                    </defs>
                </svg>
                {hasSingleLink && displayQRCode ? (
                    <div className="klip-modal__single_wallet">
                        <a
                            onClick={() => saveMobileLinkInfo({ name: links[0].name, href: singleLinkHref })}
                            href={singleLinkHref}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            {props.text.connect_with + ' ' + (hasSingleLink ? links[0].name : '') + ' ›'}
                        </a>
                    </div>
                ) : null}
                {displayQRCode || (!loading && !links.length) ? (
                    <QRCodeDisplay {...displayProps} />
                ) : (
                    <div>{errorMessage}</div>
                )}
            </div>
        </div>
    );
}

export default Modal;
