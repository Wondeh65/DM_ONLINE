const classTemplates = {
  Warrior: { name: 'Warrior', hp: 120, mana: 20, attack: 16, skill: 24, heal: 10 },
  Mage: { name: 'Mage', hp: 90, mana: 40, attack: 14, skill: 28, heal: 12 },
  Rogue: { name: 'Rogue', hp: 105, mana: 25, attack: 18, skill: 22, heal: 11 },
};

const enemyPool = [
  { name: 'Shadow Wolf', hp: 42, attack: 8, xp: 12, gold: 10 },
  { name: 'Bone Raider', hp: 54, attack: 11, xp: 18, gold: 14 },
  { name: 'Thorn Beast', hp: 68, attack: 13, xp: 24, gold: 18 },
  { name: 'Frost Wraith', hp: 82, attack: 16, xp: 30, gold: 22 },
  { name: 'Cinder Titan', hp: 100, attack: 18, xp: 38, gold: 30 },
];

const defaultState = {
  player: {
    name: 'Aster',
    className: 'Warrior',
    hp: 120,
    mana: 20,
    maxHp: 120,
    maxMana: 20,
    attack: 16,
    skill: 24,
    heal: 10,
    gold: 20,
    level: 1,
    xp: 0,
    inventory: ['Potion', 'Iron Charm'],
  },
  enemy: null,
  log: ['Welcome to DM Online. The dungeon is waiting.'],
  quest: 0,
  battleCount: 0,
};

const state = loadGame();

const ui = {
  playerName: document.getElementById('player-name'),
  playerClass: document.getElementById('player-class'),
  hpValue: document.getElementById('hp-value'),
  manaValue: document.getElementById('mana-value'),
  attackValue: document.getElementById('attack-value'),
  goldValue: document.getElementById('gold-value'),
  levelValue: document.getElementById('level-value'),
  xpValue: document.getElementById('xp-value'),
  enemyName: document.getElementById('enemy-name'),
  enemyRank: document.getElementById('enemy-rank'),
  enemyHealthBar: document.getElementById('enemy-health-bar'),
  enemyHealthText: document.getElementById('enemy-health-text'),
  enemyInfo: document.getElementById('enemy-info'),
  logList: document.getElementById('log-list'),
  inventoryList: document.getElementById('inventory-list'),
  questText: document.getElementById('quest-text'),
  classButtons: [...document.querySelectorAll('.class-btn')],
  attackBtn: document.getElementById('attack-btn'),
  skillBtn: document.getElementById('skill-btn'),
  healBtn: document.getElementById('heal-btn'),
  exploreBtn: document.getElementById('explore-btn'),
  newGameBtn: document.getElementById('new-game'),
  saveGameBtn: document.getElementById('save-game'),
};

setupEvents();
render();

function setupEvents() {
  ui.classButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedClass = button.dataset.class;
      state.player.className = selectedClass;
      applyClassStats(selectedClass);
      render();
      saveGame();
    });
  });

  ui.attackBtn.addEventListener('click', handleAttack);
  ui.skillBtn.addEventListener('click', handleSkill);
  ui.healBtn.addEventListener('click', handleHeal);
  ui.exploreBtn.addEventListener('click', handleExplore);
  ui.newGameBtn.addEventListener('click', () => {
    const fresh = deepClone(defaultState);
    Object.assign(state, fresh);
    state.player.name = 'Aster';
    applyClassStats(state.player.className);
    state.enemy = createEnemy(state.battleCount + 1);
    logEvent('A new adventure begins.');
    saveGame();
    render();
  });

  ui.saveGameBtn.addEventListener('click', () => {
    saveGame();
    logEvent('Progress saved.');
    render();
  });
}

function applyClassStats(className) {
  const template = classTemplates[className];
  state.player.maxHp = template.hp;
  state.player.maxMana = template.mana;
  state.player.attack = template.attack;
  state.player.skill = template.skill;
  state.player.heal = template.heal;

  if (state.player.hp <= 0 || state.player.hp > state.player.maxHp) {
    state.player.hp = state.player.maxHp;
  }
  if (state.player.mana > state.player.maxMana) {
    state.player.mana = state.player.maxMana;
  }
}

function createEnemy(levelBoost = 1) {
  const poolIndex = Math.min(enemyPool.length - 1, Math.max(0, levelBoost - 1));
  const template = enemyPool[poolIndex];
  const level = Math.max(1, Math.floor((state.player.level + levelBoost) / 2));
  const hpBoost = (level - 1) * 8;

  return {
    name: template.name,
    hp: template.hp + hpBoost,
    maxHp: template.hp + hpBoost,
    attack: template.attack + Math.floor(level / 2),
    xp: template.xp + level * 4,
    gold: template.gold + level * 3,
    level,
  };
}

function render() {
  const player = state.player;

  ui.playerName.textContent = player.name;
  ui.playerClass.textContent = player.className;
  ui.hpValue.textContent = `${player.hp} / ${player.maxHp}`;
  ui.manaValue.textContent = `${player.mana} / ${player.maxMana}`;
  ui.attackValue.textContent = player.attack;
  ui.goldValue.textContent = player.gold;
  ui.levelValue.textContent = player.level;
  ui.xpValue.textContent = `${player.xp} / ${player.level * 40}`;

  const enemy = state.enemy || createEnemy();
  ui.enemyName.textContent = enemy.name;
  ui.enemyRank.textContent = `Lv.${enemy.level}`;
  const healthPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
  ui.enemyHealthBar.style.width = `${healthPercent}%`;
  ui.enemyHealthText.textContent = `${enemy.hp} / ${enemy.maxHp}`;
  ui.enemyInfo.innerHTML = `
    <div class="mini"><span>ATK</span><strong>${enemy.attack}</strong></div>
    <div class="mini"><span>XP</span><strong>${enemy.xp}</strong></div>
    <div class="mini"><span>Gold</span><strong>${enemy.gold}</strong></div>
  `;

  ui.logList.innerHTML = state.log
    .slice(-8)
    .reverse()
    .map((entry) => `<li>${entry}</li>`)
    .join('');

  ui.inventoryList.innerHTML = player.inventory
    .map((item) => `<li><span>${item}</span><strong>+</strong></li>`)
    .join('');

  ui.questText.textContent = questText();

  ui.classButtons.forEach((button) => {
    const match = button.dataset.class === player.className;
    button.classList.toggle('selected', match);
  });
}

function handleAttack() {
  if (!state.enemy) {
    state.enemy = createEnemy();
  }

  const attackValue = state.player.attack + randomInt(0, 8);
  state.enemy.hp -= attackValue;
  logEvent(`${state.player.name} hits ${state.enemy.name} for ${attackValue} damage.`);

  if (state.enemy.hp <= 0) {
    defeatEnemy();
    return;
  }

  enemyTurn();
  render();
}

function handleSkill() {
  if (state.player.mana < 10) {
    logEvent('Not enough mana for the skill.');
    render();
    return;
  }

  state.player.mana -= 10;
  const skillDamage = state.player.skill + randomInt(5, 20);
  state.enemy.hp -= skillDamage;
  logEvent(`${state.player.className} casts a force blast for ${skillDamage} damage.`);

  if (state.enemy.hp <= 0) {
    defeatEnemy();
    return;
  }

  enemyTurn();
  render();
}

function handleHeal() {
  if (state.player.mana < 6) {
    logEvent('You need more mana to heal.');
    render();
    return;
  }

  state.player.mana -= 6;
  const healAmount = state.player.heal + randomInt(5, 12);
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + healAmount);
  logEvent(`${state.player.name} restores ${healAmount} HP with a healing spell.`);
  enemyTurn();
  render();
}

function handleExplore() {
  const rewardRoll = randomInt(1, 100);

  if (rewardRoll < 40) {
    const goldGain = randomInt(8, 16);
    state.player.gold += goldGain;
    logEvent(`You explore a hidden ruin and find ${goldGain} gold.`);
  } else if (rewardRoll < 70) {
    const item = ['Mana Potion', 'Sharp Blade', 'Moon Gem'][randomInt(0, 2)];
    state.player.inventory.push(item);
    logEvent(`You discover a ${item} while wandering the ruins.`);
  } else {
    const foundEnemy = createEnemy(state.player.level + 1);
    state.enemy = foundEnemy;
    logEvent(`A surprise enemy appears: ${foundEnemy.name}.`);
    enemyTurn();
  }

  render();
}

function enemyTurn() {
  if (!state.enemy || state.player.hp <= 0) {
    return;
  }

  const damage = Math.max(3, state.enemy.attack + randomInt(0, 6) - 2);
  state.player.hp = Math.max(0, state.player.hp - damage);
  logEvent(`${state.enemy.name} strikes for ${damage} damage.`);

  if (state.player.hp <= 0) {
    state.player.hp = state.player.maxHp;
    state.player.mana = state.player.maxMana;
    state.player.gold = Math.max(0, state.player.gold - 5);
    state.player.inventory = ['Potion'];
    logEvent('You fall in battle. The dungeon lets you return with a small penalty.');
    const newBattle = createEnemy(Math.max(1, state.player.level));
    state.enemy = newBattle;
  }
}

function defeatEnemy() {
  const enemy = state.enemy;
  state.player.xp += enemy.xp;
  state.player.gold += enemy.gold;
  state.player.mana = Math.min(state.player.maxMana, state.player.mana + 8);
  state.quest += 1;
  state.battleCount += 1;

  logEvent(`${enemy.name} is defeated. You gain ${enemy.xp} XP and ${enemy.gold} gold.`);

  if (state.player.xp >= state.player.level * 40) {
    state.player.level += 1;
    state.player.xp = 0;
    state.player.maxHp += 12;
    state.player.maxMana += 5;
    state.player.hp = state.player.maxHp;
    state.player.mana = state.player.maxMana;
    state.player.attack += 2;
    state.player.skill += 2;
    logEvent(`Level up! ${state.player.name} grows stronger.`);
  }

  state.enemy = createEnemy(state.battleCount + 1);
  render();
}

function questText() {
  if (state.quest >= 3) {
    return 'Quest complete: The Rusted Crown is yours. The dungeon is yours to master.';
  }

  return `Defeat ${Math.max(0, 3 - state.quest)} more enemies to earn the Rusted Crown.`;
}

function logEvent(message) {
  state.log.push(message);
  if (state.log.length > 18) {
    state.log = state.log.slice(-18);
  }
}

function loadGame() {
  const saved = localStorage.getItem('dm-online-save');
  if (!saved) {
    const fresh = deepClone(defaultState);
    fresh.player = { ...fresh.player, hp: fresh.player.maxHp, mana: fresh.player.maxMana };
    fresh.enemy = createEnemy(1);
    return fresh;
  }

  try {
    const parsed = JSON.parse(saved);
    const restored = deepClone(defaultState);
    const merged = { ...restored, ...parsed, player: { ...restored.player, ...parsed.player } };
    merged.player.hp = Math.min(merged.player.hp || merged.player.maxHp, merged.player.maxHp);
    merged.player.mana = Math.min(merged.player.mana || merged.player.maxMana, merged.player.maxMana);
    merged.enemy = merged.enemy || createEnemy(1);
    return merged;
  } catch (error) {
    return deepClone(defaultState);
  }
}

function saveGame() {
  localStorage.setItem('dm-online-save', JSON.stringify(state));
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
