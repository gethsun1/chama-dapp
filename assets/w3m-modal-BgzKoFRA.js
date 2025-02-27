import{a as U,r as T,O as y,M as i,b as n,A as k,d as C,x as w,o as I,R as h,e as N,T as O,f as L,h as K,j as R,k as z,l as M,m as P,p,q as $}from"./index-BZV5GFG8.js";const W=U`
  :host {
    z-index: var(--w3m-z-index);
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: var(--wui-cover);
    transition: opacity 0.2s var(--wui-ease-out-power-2);
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
  }

  :host(.embedded) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--w3m-modal-width);
    width: 100%;
    position: relative;
    animation: zoom-in 0.2s var(--wui-ease-out-power-2);
    animation-fill-mode: backwards;
    outline: none;
    transition:
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: border-radius, background-color;
  }

  :host(.embedded) wui-card {
    max-width: 400px;
  }

  wui-card[shake='true'] {
    animation:
      zoom-in 0.2s var(--wui-ease-out-power-2),
      w3m-shake 0.5s var(--wui-ease-out-power-2);
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--wui-spacing-xxl) 0px;
    }
  }

  @media (max-width: 430px) {
    wui-flex {
      align-items: flex-end;
    }

    wui-card {
      max-width: 100%;
      border-bottom-left-radius: var(--local-border-bottom-mobile-radius);
      border-bottom-right-radius: var(--local-border-bottom-mobile-radius);
      border-bottom: none;
      animation: slide-in 0.2s var(--wui-ease-out-power-2);
    }

    wui-card[shake='true'] {
      animation:
        slide-in 0.2s var(--wui-ease-out-power-2),
        w3m-shake 0.5s var(--wui-ease-out-power-2);
    }
  }

  @keyframes zoom-in {
    0% {
      transform: scale(0.95) translateY(0);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes slide-in {
    0% {
      transform: scale(1) translateY(50px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes w3m-view-height {
    from {
      height: var(--prev-height);
    }
    to {
      height: var(--new-height);
    }
  }
`;var l=function(m,e,t,o){var s=arguments.length,a=s<3?e:o===null?o=Object.getOwnPropertyDescriptor(e,t):o,d;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")a=Reflect.decorate(m,e,t,o);else for(var c=m.length-1;c>=0;c--)(d=m[c])&&(a=(s<3?d(a):s>3?d(e,t,a):d(e,t))||a);return s>3&&a&&Object.defineProperty(e,t,a),a};const x="scroll-lock";let r=class extends T{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.hasPrefetched=!1,this.enableEmbedded=y.state.enableEmbedded,this.open=i.state.open,this.caipAddress=n.state.activeCaipAddress,this.caipNetwork=n.state.activeCaipNetwork,this.shake=i.state.shake,this.initializeTheming(),k.prefetchAnalyticsConfig(),this.unsubscribe.push(i.subscribeKey("open",e=>e?this.onOpen():this.onClose()),i.subscribeKey("shake",e=>this.shake=e),n.subscribeKey("activeCaipNetwork",e=>this.onNewNetwork(e)),n.subscribeKey("activeCaipAddress",e=>this.onNewAddress(e)),y.subscribeKey("enableEmbedded",e=>this.enableEmbedded=e))}firstUpdated(){var e,t;if(C.fetchNetworkImage((t=(e=this.caipNetwork)==null?void 0:e.assets)==null?void 0:t.imageId),this.caipAddress){if(this.enableEmbedded){i.close(),this.prefetch();return}this.onNewAddress(this.caipAddress)}this.open&&this.onOpen(),this.enableEmbedded&&this.prefetch()}disconnectedCallback(){this.unsubscribe.forEach(e=>e()),this.onRemoveKeyboardListener()}render(){return this.style.cssText=`
      --local-border-bottom-mobile-radius: ${this.enableEmbedded?"clamp(0px, var(--wui-border-radius-l), 44px)":"0px"};
    `,this.enableEmbedded?w`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?w`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return w` <wui-card
      shake="${this.shake}"
      data-embedded="${I(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(e){e.target===e.currentTarget&&await this.handleClose()}async handleClose(){h.state.view==="UnsupportedChain"||await N.isSIWXCloseDisabled()?i.shake():i.close()}initializeTheming(){const{themeVariables:e,themeMode:t}=O.state,o=L.getColorTheme(t);K(e,o)}onClose(){this.open=!1,this.classList.remove("open"),this.onScrollUnlock(),R.hide(),this.onRemoveKeyboardListener()}onOpen(){this.prefetch(),this.open=!0,this.classList.add("open"),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){const e=document.createElement("style");e.dataset.w3m=x,e.textContent=`
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `,document.head.appendChild(e)}onScrollUnlock(){const e=document.head.querySelector(`style[data-w3m="${x}"]`);e&&e.remove()}onAddKeyboardListener(){var t;this.abortController=new AbortController;const e=(t=this.shadowRoot)==null?void 0:t.querySelector("wui-card");e==null||e.focus(),window.addEventListener("keydown",o=>{if(o.key==="Escape")this.handleClose();else if(o.key==="Tab"){const{tagName:s}=o.target;s&&!s.includes("W3M-")&&!s.includes("WUI-")&&(e==null||e.focus())}},this.abortController)}onRemoveKeyboardListener(){var e;(e=this.abortController)==null||e.abort(),this.abortController=void 0}async onNewAddress(e){const t=n.state.isSwitchingNamespace,o=z.getPlainAddress(e);!o&&!t?i.close():t&&o&&h.goBack(),await N.initializeIfEnabled(),this.caipAddress=e,n.setIsSwitchingNamespace(!1)}onNewNetwork(e){var u,b,f,g,v;C.fetchNetworkImage((u=e==null?void 0:e.assets)==null?void 0:u.imageId);const t=(f=(b=this.caipNetwork)==null?void 0:b.caipNetworkId)==null?void 0:f.toString(),o=(g=e==null?void 0:e.caipNetworkId)==null?void 0:g.toString(),s=t&&o&&t!==o,a=n.state.isSwitchingNamespace,d=((v=this.caipNetwork)==null?void 0:v.name)===M.UNSUPPORTED_NETWORK_NAME,c=h.state.view==="ConnectingExternal",S=!this.caipAddress,A=s&&!d&&!a,E=h.state.view==="UnsupportedChain";!c&&(S||E||A)&&h.goBack(),this.caipNetwork=e}prefetch(){this.hasPrefetched||(this.hasPrefetched=!0,k.prefetch())}};r.styles=W;l([P({type:Boolean})],r.prototype,"enableEmbedded",void 0);l([p()],r.prototype,"open",void 0);l([p()],r.prototype,"caipAddress",void 0);l([p()],r.prototype,"caipNetwork",void 0);l([p()],r.prototype,"shake",void 0);r=l([$("w3m-modal")],r);export{r as W3mModal};
