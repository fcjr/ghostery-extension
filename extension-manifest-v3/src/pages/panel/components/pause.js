/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { dispatch, html, msg } from 'hybrids';

const PAUSE_TYPES = [
  {
    value: 1,
    label: msg`1 hour`,
    description: msg`Ghostery will be paused on this site for 1 hour`,
  },
  {
    value: 24,
    label: msg`1 day`,
    description: msg`Ghostery will be paused on this site for 1 day`,
  },
  {
    value: 0,
    label: msg`Always`,
    description: msg`Ghostery will be paused on this site. You can change this at any time in Ghostery settings to stop trackers and ads from tracking you around the web`,
  },
];

function dispatchAction(host) {
  dispatch(host, 'action');
}

function dispatchTypeAction(type) {
  return (host) => {
    host.pauseType = type;
    dispatchAction(host);
  };
}

function openPauseList(host, event) {
  host.pauseList = true;
  event.stopPropagation();

  document.body.addEventListener(
    'click',
    (e) => {
      host.pauseList = false;

      e.stopPropagation();
      e.preventDefault();
    },
    { once: true },
  );
}

function simulateClickOnEnter(host, event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    event.target.click();
  }
}

export default {
  paused: false,
  pauseType: 1,
  pauseList: false,
  render: ({ paused, pauseType, pauseList }) => html`
    <template layout="grid">
      <button
        id="main"
        class="${{ active: pauseList, paused }}"
        layout="row center margin:2 height:6"
        onclick="${!pauseList && dispatchAction}"
      >
        <div id="label" layout="grow row center gap:0.5 shrink overflow">
          <ui-icon name="pause" color="gh-panel-action"></ui-icon>
          <ui-text type="label-m" color="gh-panel-action" layout="block:center">
            ${paused ? msg`Ghostery paused` : msg`Pause on this site`}
          </ui-text>
        </div>
        <div
          id="type"
          role="button"
          tabindex="${paused ? '-1' : '0'}"
          layout="row center self:stretch width:13"
          onclick="${!paused && !pauseList && openPauseList}"
          onkeypress=${!paused && !pauseList && simulateClickOnEnter}
        >
          ${paused
            ? html`
                <ui-icon name="refresh" color="danger-500"></ui-icon>
                <ui-text
                  type="label-m"
                  color="danger-500"
                  layout="margin:left:0.5"
                >
                  Resume <span translate="no">Ghostery</span>
                </ui-text>
              `
            : html`
                <ui-text type="label-m" color="gh-panel-action" layout="grow">
                  ${PAUSE_TYPES.find(({ value }) => value === pauseType).label}
                </ui-text>
                <ui-icon name="arrow-down" color="gh-panel-action"></ui-icon>
              `}
        </div>
      </button>
      ${pauseList &&
      html`
        <section
          id="type-list"
          layout="column absolute layer:102 top:full left:2 right:2 margin:top:-20px"
        >
          ${PAUSE_TYPES.map(
            ({ value, label, description }) => html`
              <button
                class="${{ active: pauseType === value }}"
                onclick="${dispatchTypeAction(value)}"
                layout.active="grid:1|max:auto"
              >
                <ui-text type="label-m" color="gray-900">${label}</ui-text>
                ${pauseType === value && html`<ui-icon name="check"></ui-icon>`}
                <ui-text type="body-s" color="gray-600" layout="area:2">
                  ${description}
                </ui-text>
              </button>
            `,
          )}
        </section>
      `}
    </template>
  `.css`
    :host {
      position: relative;
      background: var(--ui-color-primary-200);
      --ui-color-gh-panel-action: var(--ui-color-primary-700);
    }

    :host([paused]) {
      background: var(--ui-color-danger-100);
    }

    button {
      cursor: pointer;
      appearance: none;
      border: none;
      background: var(--ui-color-white);
      text-align: left;
    }

    #main {
      background: var(--ui-color-white);
      box-shadow: 0px 2px 8px rgba(0, 105, 210, 0.2);
      border-radius: 8px;
      box-sizing: border-box;
      padding: 4px;
    }

    #main, #label, #type { transition: all 0.2s; }

    #main.active {
      background: var(--ui-color-primary-500);
      --ui-color-gh-panel-action: var(--ui-color-white);
    }

    #main:active:not(:has(#type:hover)), #main:active.paused {
      opacity: 0.6;
    }

    #type {
      box-sizing: border-box;
      background: var(--ui-color-primary-100);
      border-radius: 8px;
      border: 1px solid var(--ui-color-primary-300);
      padding: 8px 8px 8px 12px;
      white-space: nowrap;
    }

    #type ui-icon {
      transition: transform 0.1s;
    }

    #main.active #type {
      --ui-color-gh-panel-action: var(--ui-color-white);
      background: var(--ui-color-primary-700);
      border-color: var(--ui-color-primary-700);
    }

    #main.active #type ui-icon {
      transform: rotate(180deg);
    }

    #main.paused, #main.paused:hover, #main.paused:active {
      pointer-events: none;
      background: var(--ui-color-danger-500);
      white-space: nowrap;
      --ui-color-gh-panel-action: var(--ui-color-white);
    }

    @media (hover: hover) and (pointer: fine) {
      #main:hover {
        background: var(--ui-color-primary-500);
        --ui-color-gh-panel-action: var(--ui-color-white);
      }

      #main:hover:not(.active) #type {
        --ui-color-gh-panel-action: var(--ui-color-primary-700);
        border-color: var(--ui-color-primary-100);
      }

      #main:hover #type:hover {
        --ui-color-gh-panel-action: var(--ui-color-white);
        background: var(--ui-color-primary-700);
        border-color: var(--ui-color-primary-700);
      }

      #main.paused:hover:has(#type:hover) #label, #main.paused:focus-visible #label {
        width: 0;
      }

      #main.paused:hover:has(#type:hover) #type, #main.paused:focus-visible #type {
        width: 100%;
        transition: width 0.2s;
      }

      #main.paused:hover:has(#type:hover) #type span {
        display: inline;
      }

      #main.paused #type:hover {
        background: var(--ui-color-white);
      }
    }

    #main.paused #type {
      pointer-events: all;
      overflow: hidden;
      border: none;
      background: var(--ui-color-white);
    }

    #main.paused #type span {
      display: none;
    }

    #type-list {
      background: var(--ui-color-white);
      box-shadow: 0px 4px 12px rgba(0, 105, 210, 0.4);
      border-radius: 12px;
    }

    #type-list button {
      padding: 16px 20px;
    }

    #type-list button:first-child {
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
    }

    #type-list button:last-child {
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
    }

    #type-list button:hover {
      background: var(--ui-color-primary-100);
    }

    #type-list button:hover ui-text {
      color: var(--ui-color-primary-700);
    }
  `,
};
