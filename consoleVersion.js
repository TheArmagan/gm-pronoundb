// AuthorID: 707309693449535599

(() => {
  let { getUsers } = goosemod.webpackModules.findByProps("getUsers");

  let PronounTypes = {
    "unspecified": "Unspecified",
    "hh": "He/Him",
    "hi": "He/It",
    "hs": "He/She",
    "ht": "He/They",
    "ih": "It/Him",
    "ii": "It/Its",
    "is": "It/She",
    "it": "It/They",
    "shh": "She/He",
    "sh": "She/Her",
    "si": "She/It",
    "st": "She/They",
    "th": "They/He",
    "ti": "They/It",
    "ts": "They/She",
    "tt": "They/Them",
    "any": "Any pronouns",
    "other": "Other pronouns",
    "ask": "Ask me my pronouns",
    "avoid": "Avoid pronouns, use my name"
  }

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
      span.classList.add("discriminator-xUhQkU");
      span.setAttribute("style", "font-size:16px;padding-bottom:2px;user-select:text;");
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
      span.setAttribute("style", "margin-bottom:2px;opacity:0.8;");
      userHeaderTextElement.prepend(span);

      return true;
    } else {
      return;
    }
  }

  setInterval(check, 100);
})();