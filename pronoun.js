// AuthorID: 707309693449535599

import { findByProps } from '@goosemod/webpack';
import * as PronounTypes from "./PronounTypes.json";

const { getUsers } = findByProps("getUsers");

function findUserByTag(tag = "") {
  return Object.values(getUsers()).find(i => i.tag == tag);
}

let notFoundCache = {};
let pronounsCache = {};

async function getPronounsById(id) {
  if (notFoundCache[id]) return null;
  let pronouns = pronounsCache[id];
  if (pronouns) return pronouns;

  let responseJson = await fetch(`https://pronoundb.org/api/v1/lookup?platform=discord&id=${id}`).then(d => d.json());
  if (responseJson.hasOwnProperty("error")) {
    notFoundCache[id] = true;
    return null;
  } else {
    pronouns = PronounTypes[responseJson.pronouns];
    pronounsCache[id] = pronouns;
    return pronouns;
  }
}

async function check() {

  let userPopoutBig = document.querySelector('[class*="flex"][class*="vertical"][class*="directionColumn"]:not(.pronoun-stop-checking)');
  let userPopoutSmall = document.querySelector('[class*="userPopout"]:not(.pronoun-stop-checking)');

  if (userPopoutBig) {
    userPopoutBig.classList.add("pronoun-stop-checking");

    let headerInfoElement = userPopoutBig.querySelector('[class*="headerInfo"]');
    if (!headerInfoElement) return;

    let nameTagElement = headerInfoElement.querySelector('[class*="nameTag"]');
    if (!nameTagElement) return;

    let userTag = nameTagElement.textContent?.trim();
    let user = findUserByTag(userTag);
    if (!user) return;

    let pronouns = await getPronounsById(user.id);
    if (!pronouns) return;

    let span = document.createElement("span");
    span.textContent = pronouns;
    span.setAttribute("style", "font-size:16px;padding-bottom:2px;color:var(--header-secondary);user-select:text;");
    headerInfoElement.prepend(span);

    return true;
  } else if (userPopoutSmall) {
    userPopoutSmall.classList.add("pronoun-stop-checking");

    let userHeaderTextElement = userPopoutSmall.querySelector('[class*="headerText"]');
    let userTagElement = userPopoutSmall.querySelector('[class*="headerTag"]');
    if (!userTagElement || !userHeaderTextElement) return;
    

    let userTag = userTagElement.textContent?.trim();
    let user = findUserByTag(userTag);
    if (!user) return;

    let pronouns = await getPronounsById(user.id);
    if (!pronouns) return;

    let span = document.createElement("span");
    span.textContent = `(${pronouns})`;
    span.setAttribute("style", "margin-bottom:2px;opacity:0.9;");
    userHeaderTextElement.prepend(span);

    return true;
  } else {
    return;
  }

}

let interval;

export default {
  goosemodHandlers: {
    onImport() {
      interval = setInterval(check, 100);
    },
    onRemove() {
      clearInterval(interval);
      notFoundCache = {};
      pronounsCache = {};
    }
  }
};