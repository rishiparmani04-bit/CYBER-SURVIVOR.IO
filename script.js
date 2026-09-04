/**
 * CYBER SURVIVOR: OVERDRIVE
 * Complete 2D Action Roguelite Game Engine
 * Features: 4 Hero Classes, Web Audio Synthesis (SFX + Synthwave OST),
 * Particle Engine, Screen Shake, Telegraphs, Boss AI, 25+ Roguelite Perks,
 * Cybernetics Matrix, Touch/Gamepad/Keyboard Controls.
 */

(() => {
  'use strict';

// ============================================================================
// CONSTANTS & GAME CONFIG
// ============================================================================
const WORLD_WIDTH = 2600;
const WORLD_HEIGHT = 2600;
const CANVAS_FPS = 60;
const FIXED_STEP = 1 / CANVAS_FPS;

const RARITY_COLORS = {
  common: '#00f0ff',
  rare: '#00ff88',
  epic: '#b336ff',
  legendary: '#ffaa00'
};

// ============================================================================
// AUTOMATED WEEKLY ROTATING SHOP BUNDLES DATA POOL
// ============================================================================
const WEEKLY_BUNDLES = [
  {
    id: 'bundle_cyber_ops',
    title: 'CYBER OPS ELITE BUNDLE',
    tag: '🔥 SPECIAL OPERATIVE BUNDLE • LIMITED TIME (50% OFF)',
    desc: 'Instant delivery of <strong>1,200 💎 Diamonds</strong>, <strong>25,000 🪙 Cyber Coins</strong>, and the Legendary <strong>AK-47 "Dragonfire"</strong> Skin!',
    gems: 1200,
    coins: 25000,
    weaponId: 'ak47',
    skinId: 'ak47_dragonfire',
    skinName: 'AK-47 Dragonfire',
    perks: [
      { text: '💎 1,200 Diamonds', class: '' },
      { text: '🪙 25,000 Coins', class: '' },
      { text: '🔥 AK-47 Dragonfire Skin', class: 'special-gold' }
    ],
    originalCost: 30000,
    discountedCost: 15000,
    costType: 'coins',
    themeColor: '#ffaa00'
  },
  {
    id: 'bundle_neon_striker',
    title: 'NEON STRIKER BUNDLE',
    tag: '⚡ NEON OVERDRIVE • LIMITED TIME (50% OFF)',
    desc: 'Instant delivery of <strong>1,500 💎 Diamonds</strong>, <strong>35,000 🪙 Cyber Coins</strong>, and the Epic <strong>UMP "Synthwave Neon"</strong> Skin!',
    gems: 1500,
    coins: 35000,
    weaponId: 'ump',
    skinId: 'ump_synthwave',
    skinName: 'UMP Synthwave Neon',
    perks: [
      { text: '💎 1,500 Diamonds', class: '' },
      { text: '🪙 35,000 Coins', class: '' },
      { text: '⚡ UMP Synthwave Neon Skin', class: 'special-cyan' }
    ],
    originalCost: 36000,
    discountedCost: 18000,
    costType: 'coins',
    themeColor: '#00f0ff'
  },
  {
    id: 'bundle_quantum_phantom',
    title: 'QUANTUM PHANTOM BUNDLE',
    tag: '🌌 VOID PROTOCOL • LIMITED TIME (50% OFF)',
    desc: 'Instant delivery of <strong>2,000 💎 Diamonds</strong>, <strong>45,000 🪙 Cyber Coins</strong>, and the Legendary <strong>AWM "Hyper Beast"</strong> Sniper Skin!',
    gems: 2000,
    coins: 45000,
    weaponId: 'awm',
    skinId: 'awm_hyperbeast',
    skinName: 'AWM Hyper Beast',
    perks: [
      { text: '💎 2,000 Diamonds', class: '' },
      { text: '🪙 45,000 Coins', class: '' },
      { text: '🌌 AWM Hyper Beast Skin', class: 'special-purple' }
    ],
    originalCost: 44000,
    discountedCost: 22000,
    costType: 'coins',
    themeColor: '#b336ff'
  },
  {
    id: 'bundle_mecha_overlord',
    title: 'MECHA OVERLORD BUNDLE',
    tag: '🤖 TITAN PROTOCOL • LIMITED TIME (50% OFF)',
    desc: 'Instant delivery of <strong>2,500 💎 Diamonds</strong>, <strong>60,000 🪙 Cyber Coins</strong>, and the Legendary <strong>MP-40 "Bloodhound"</strong> Skin!',
    gems: 2500,
    coins: 60000,
    weaponId: 'mp40',
    skinId: 'mp40_bloodhound',
    skinName: 'MP-40 Bloodhound',
    perks: [
      { text: '💎 2,500 Diamonds', class: '' },
      { text: '🪙 60,000 Coins', class: '' },
      { text: '🤖 MP-40 Bloodhound Skin', class: 'special-red' }
    ],
    originalCost: 50000,
    discountedCost: 25000,
    costType: 'coins',
    themeColor: '#ff2a2a'
  },
  {
    id: 'bundle_doom_annihilator',
    title: 'DOOM ANNIHILATOR BUNDLE',
    tag: '💥 HELLFIRE ARSENAL • LIMITED TIME (50% OFF)',
    desc: 'Instant delivery of <strong>1,800 💎 Diamonds</strong>, <strong>40,000 🪙 Cyber Coins</strong>, and the Legendary <strong>Double Barrel "Doom Bringer"</strong> Shotgun Skin!',
    gems: 1800,
    coins: 40000,
    weaponId: 'double_barrel',
    skinId: 'double_barrel_doom',
    skinName: 'Double Barrel Doom Bringer',
    perks: [
      { text: '💎 1,800 Diamonds', class: '' },
      { text: '🪙 40,000 Coins', class: '' },
      { text: '💥 Doom Bringer Skin', class: 'special-gold' }
    ],
    originalCost: 40000,
    discountedCost: 20000,
    costType: 'coins',
    themeColor: '#f59e0b'
  }
];

const HERO_DEFS = {
  commando: {
    id: 'commando',
    name: 'Cyber Commando',
    title: 'ASSAULT SPECIALIST',
    icon: '🚀',
    desc: 'Rapid Plasma Rifle • Cluster Grenades • Overdrive Storm',
    outfit: '🪖 Cyan Strike Ops Armor',
    unlockCost: 0,
    hp: 120,
    shield: 60,
    speed: 260,
    damage: 1.0,
    fireRate: 0.12, // seconds per shot
    critChance: 0.12,
    critMult: 2.0,
    color: '#00f0ff',
    bulletColor: '#00f0ff',
    bulletSpeed: 750,
    bulletSize: 5,
    bulletRange: 800,
    specialCooldown: 6.0,
    ultCooldown: 20.0,
    specialName: 'GRENADE VOLLEY',
    specialIcon: '💣',
    ultName: 'BULLET STORM',
    ultIcon: '💥'
  },
  ninja: {
    id: 'ninja',
    name: 'Shadow Ninja',
    title: 'CYBER SHINOBI',
    icon: '⚡',
    desc: 'Neon Katana (Bullet Deflection) • Shadow Blink • Blade Hurricane',
    outfit: '🥷 Magenta Stealth Shinobi Cowl',
    unlockCost: 400,
    hp: 90,
    shield: 40,
    speed: 310,
    damage: 1.35,
    fireRate: 0.38,
    critChance: 0.28,
    critMult: 2.5,
    color: '#ff007f',
    bulletColor: '#ff007f',
    bulletSpeed: 0, // Melee arc
    bulletSize: 18,
    bulletRange: 140,
    specialCooldown: 5.0,
    ultCooldown: 18.0,
    specialName: 'SHADOW BLINK',
    specialIcon: '⚡',
    ultName: 'BLADE VORTEX',
    ultIcon: '🌀'
  },
  juggernaut: {
    id: 'juggernaut',
    name: 'Heavy Juggernaut',
    title: 'ARMORED SIEGE MECH',
    icon: '💥',
    desc: 'Flak Spread Shotgun • Kinetic Stun Slam • Orbital Laser',
    outfit: '🛡️ Gold Titanium Mech Chassis',
    unlockCost: 800,
    hp: 180,
    shield: 100,
    speed: 210,
    damage: 0.85,
    fireRate: 0.55,
    critChance: 0.08,
    critMult: 1.8,
    color: '#ffaa00',
    bulletColor: '#ffaa00',
    bulletSpeed: 650,
    bulletSize: 6,
    bulletRange: 600,
    specialCooldown: 7.0,
    ultCooldown: 22.0,
    specialName: 'KINETIC SLAM',
    specialIcon: '🛡️',
    ultName: 'ORBITAL BEAM',
    ultIcon: '🛰️'
  },
  psionic: {
    id: 'psionic',
    name: 'Void Psionic',
    title: 'DARK MATTER ADEPT',
    icon: '🔮',
    desc: 'Homing Void Bolts • Gravity Black Hole • Supernova Cataclysm',
    outfit: '🔮 Amethyst Void Robes & Orbs',
    unlockCost: 1200,
    hp: 100,
    shield: 50,
    speed: 250,
    damage: 1.15,
    fireRate: 0.28,
    critChance: 0.15,
    critMult: 2.2,
    color: '#b336ff',
    bulletColor: '#b336ff',
    bulletSpeed: 520,
    bulletSize: 8,
    bulletRange: 750,
    specialCooldown: 8.0,
    ultCooldown: 24.0,
    specialName: 'GRAVITY HOLE',
    specialIcon: '🕳️',
    ultName: 'SUPERNOVA',
    ultIcon: '🌟'
  },
  valkyrie: {
    id: 'valkyrie',
    name: 'Cyber Valkyrie',
    title: 'AERIAL JETPACK ACE',
    icon: '🪽',
    desc: 'Dual Crimson SMGs • Napalm Dash • Plasma Missile Swarm',
    outfit: '🪽 Crimson Winged Jetpack Armor',
    unlockCost: 1600,
    hp: 110,
    shield: 70,
    speed: 280,
    damage: 1.05,
    fireRate: 0.09,
    critChance: 0.18,
    critMult: 2.1,
    color: '#ff2a4b',
    bulletColor: '#ff2a4b',
    bulletSpeed: 820,
    bulletSize: 4.5,
    bulletRange: 750,
    specialCooldown: 4.5,
    ultCooldown: 18.0,
    specialName: 'NAPALM DASH',
    specialIcon: '🔥',
    ultName: 'MISSILE SWARM',
    ultIcon: '🚀'
  },
  phantom: {
    id: 'phantom',
    name: 'Phantom Ghost',
    title: 'ARCTIC STEALTH REAPER',
    icon: '🎯',
    desc: 'Anti-Material Gauss Rifle • EMP Hologram • Orbital Death Ray',
    outfit: '❄️ Arctic Teal Ghillie Mantle',
    unlockCost: 2000,
    hp: 95,
    shield: 45,
    speed: 270,
    damage: 2.4,
    fireRate: 0.65,
    critChance: 0.35,
    critMult: 3.0,
    color: '#00ffcc',
    bulletColor: '#00ffcc',
    bulletSpeed: 1100,
    bulletSize: 7,
    bulletRange: 1200,
    specialCooldown: 6.0,
    ultCooldown: 22.0,
    specialName: 'EMP HOLOGRAM',
    specialIcon: '🤖',
    ultName: 'DEATH RAY',
    ultIcon: '⚡'
  },
  matrix: {
    id: 'matrix',
    name: 'Neon Matrix',
    title: 'ACID STREET HACKER',
    icon: '🧬',
    desc: 'Chain Arc Blaster • Glitch Telefrag • Time-Freeze Overclock',
    outfit: '🕶️ Acid Green Streetwear Jacket',
    unlockCost: 2500,
    hp: 115,
    shield: 65,
    speed: 290,
    damage: 1.2,
    fireRate: 0.22,
    critChance: 0.20,
    critMult: 2.3,
    color: '#00ff44',
    bulletColor: '#00ff44',
    bulletSpeed: 780,
    bulletSize: 6,
    bulletRange: 800,
    specialCooldown: 5.5,
    ultCooldown: 20.0,
    specialName: 'GLITCH TELEFRAG',
    specialIcon: '💥',
    ultName: 'TIME OVERCLOCK',
    ultIcon: '⏳'
  }
};

const HERO_ROSTER = HERO_DEFS;

const SQUAD_SLOT_DEFS = [
  { slot: 1, title: 'P1 [HOST]', color: '#00f0ff', badgeClass: 'p1-badge' },
  { slot: 2, title: 'P2', color: '#00ff88', badgeClass: 'p2-badge' },
  { slot: 3, title: 'P3', color: '#d946ef', badgeClass: 'p3-badge' },
  { slot: 4, title: 'P4', color: '#f59e0b', badgeClass: 'p4-badge' }
];

const WEAPON_DEFS = {
  ak47: {
    id: 'ak47',
    name: 'AK-47',
    category: 'ASSAULT',
    icon: '🔫',
    desc: 'Legendary 7.62mm gas-operated assault rifle with high armor penetration and stopping power.',
    unlockCost: 0,
    damage: 1.25,
    fireRate: 0.12,
    bulletSpeed: 840,
    bulletSize: 5.5,
    bulletRange: 860,
    bulletColor: '#ffaa00',
    critChance: 0.15,
    critMult: 2.2,
    pierce: 1,
    bounces: 0,
    magSize: 30,
    reloadTime: 1.8,
    sound: 'ak47',
    lore: 'World-famous 7.62x39mm assault rifle renowned for rugged durability and devastating kinetic stopping power.'
  },
  ump: {
    id: 'ump',
    name: 'UMP-45',
    category: 'SMG',
    icon: '⚡',
    desc: 'Tactical .45 ACP submachine gun delivering controllable automatic bursts and high mobility.',
    unlockCost: 300,
    damage: 1.05,
    fireRate: 0.09,
    bulletSpeed: 800,
    bulletSize: 4.8,
    bulletRange: 780,
    bulletColor: '#00f0ff',
    critChance: 0.18,
    critMult: 2.0,
    pierce: 0,
    bounces: 0,
    magSize: 25,
    reloadTime: 1.4,
    sound: 'smg',
    lore: 'Compact tactical submachine gun chambered in .45 ACP, favored by special forces for close-quarters breach ops.'
  },
  mp40: {
    id: 'mp40',
    name: 'MP-40',
    category: 'SMG',
    icon: '🔥',
    desc: 'Rapid-cycling 9mm submachine gun with exceptional handling, rapid cyclic rate and steady spray.',
    unlockCost: 600,
    damage: 0.95,
    fireRate: 0.08,
    bulletSpeed: 840,
    bulletSize: 4.5,
    bulletRange: 750,
    bulletColor: '#ff7700',
    critChance: 0.20,
    critMult: 2.1,
    pierce: 0,
    bounces: 0,
    magSize: 32,
    reloadTime: 1.5,
    sound: 'smg',
    lore: 'Iconic 9x19mm submachine gun offering extreme rate-of-fire and tight bullet grouping on fast-moving targets.'
  },
  double_barrel: {
    id: 'double_barrel',
    name: 'Double Barrel Shotgun',
    category: 'SHOTGUN',
    icon: '💥',
    desc: 'Twin-barrel 12-gauge break-action shotgun discharging a devastating 10-pellet blast.',
    unlockCost: 900,
    damage: 0.9,
    fireRate: 0.48,
    bulletSpeed: 720,
    bulletSize: 6.5,
    bulletRange: 600,
    bulletColor: '#ff3300',
    critChance: 0.12,
    critMult: 2.0,
    pellets: 10,
    magSize: 2,
    reloadTime: 1.1,
    sound: 'shotgun',
    lore: 'Dual-bore 12-gauge shotgun that tears through nearby hostiles with sheer kinetic shock.'
  },
  awm: {
    id: 'awm',
    name: 'AWM Sniper Rifle',
    category: 'SNIPER',
    icon: '🎯',
    desc: 'Extreme-range .338 Lapua Magnum bolt-action sniper rifle piercing through multiple enemies.',
    unlockCost: 1300,
    damage: 2.8,
    fireRate: 0.75,
    bulletSpeed: 1250,
    bulletSize: 7.5,
    bulletRange: 1300,
    bulletColor: '#00ffcc',
    critChance: 0.40,
    critMult: 3.2,
    pierce: 4,
    magSize: 5,
    reloadTime: 2.2,
    sound: 'sniper',
    lore: 'Arctic Warfare Magnum chambered in .338 Lapua, capable of piercing straight through 4 armored hostiles with extreme precision.'
  },
  m4a1: {
    id: 'm4a1',
    name: 'M4A1 Carbine',
    category: 'ASSAULT',
    icon: '🪖',
    desc: 'Military-grade 5.56mm select-fire carbine featuring laser accuracy and steady suppression.',
    unlockCost: 1700,
    damage: 1.15,
    fireRate: 0.10,
    bulletSpeed: 870,
    bulletSize: 5.0,
    bulletRange: 900,
    bulletColor: '#00e5ff',
    critChance: 0.18,
    critMult: 2.3,
    pierce: 1,
    bounces: 0,
    magSize: 30,
    reloadTime: 1.6,
    sound: 'm4a1',
    lore: 'Standard-issue special operations assault carbine offering unmatched balance of accuracy, range, and fire rate.'
  },
  deagle: {
    id: 'deagle',
    name: 'Desert Eagle .50',
    category: 'PISTOL',
    icon: '🦅',
    desc: 'Heavy gas-operated .50 AE magnum hand cannon with massive single-shot stopping power.',
    unlockCost: 2100,
    damage: 2.0,
    fireRate: 0.32,
    bulletSpeed: 920,
    bulletSize: 7.0,
    bulletRange: 820,
    bulletColor: '#ffaa00',
    critChance: 0.30,
    critMult: 2.8,
    pierce: 1,
    bounces: 0,
    magSize: 7,
    reloadTime: 1.3,
    sound: 'deagle',
    lore: 'Magnum hand cannon firing .50 Action Express rounds that obliterate hostile armor plates.'
  },
  p90: {
    id: 'p90',
    name: 'P90 Tactical SMG',
    category: 'SMG',
    icon: '🌪️',
    desc: 'High-capacity bullpup personal defense weapon firing 5.7x28mm armor-piercing rounds with blistering fire rate.',
    unlockCost: 2600,
    damage: 1.0,
    fireRate: 0.07,
    bulletSpeed: 880,
    bulletSize: 4.2,
    bulletRange: 800,
    bulletColor: '#33bbff',
    critChance: 0.22,
    critMult: 2.2,
    pierce: 1,
    bounces: 0,
    magSize: 50,
    reloadTime: 2.0,
    sound: 'smg',
    lore: 'Futuristic bullpup design with top-loading 50-round magazine, unleashing an unstoppable wall of lead.'
  }
};

const WEAPON_SKINS = {
  ak47: {
    default: {
      id: 'default',
      weaponId: 'ak47',
      name: 'Tactical Carbon',
      tier: 'Common',
      tierColor: '#94a3b8',
      costType: 'free',
      cost: 0,
      colors: {
        body: '#1c222e',
        wood: '#8b4513',
        handguard: '#6b3208',
        barrel: '#11151c',
        mag: '#b85d19',
        bulletColor: '#ffaa00',
        glow: '#ffaa00'
      }
    },
    ak47_dragonfire: {
      id: 'ak47_dragonfire',
      weaponId: 'ak47',
      name: 'Dragonfire',
      tier: 'Legendary',
      tierColor: '#f59e0b',
      costType: 'diamonds',
      cost: 250,
      colors: {
        body: '#3b0d0d',
        wood: '#b91c1c',
        handguard: '#dc2626',
        barrel: '#ffd700',
        mag: '#ff4500',
        bulletColor: '#ff3300',
        glow: '#ff4500'
      }
    },
    ak47_cybermatrix: {
      id: 'ak47_cybermatrix',
      weaponId: 'ak47',
      name: 'Cyber Matrix',
      tier: 'Epic',
      tierColor: '#a855f7',
      costType: 'coins',
      cost: 850,
      colors: {
        body: '#062015',
        wood: '#059669',
        handguard: '#10b981',
        barrel: '#022c22',
        mag: '#00ff88',
        bulletColor: '#00ff88',
        glow: '#00ff88'
      }
    },
    ak47_gold: {
      id: 'ak47_gold',
      weaponId: 'ak47',
      name: '24K Pure Gold',
      tier: 'Legendary',
      tierColor: '#f59e0b',
      costType: 'diamonds',
      cost: 400,
      colors: {
        body: '#ffd700',
        wood: '#b45309',
        handguard: '#f59e0b',
        barrel: '#ffea79',
        mag: '#ffe066',
        bulletColor: '#ffe066',
        glow: '#ffd700'
      }
    },
    ak47_void: {
      id: 'ak47_void',
      weaponId: 'ak47',
      name: 'Void Nebula',
      tier: 'Epic',
      tierColor: '#a855f7',
      costType: 'coins',
      cost: 1100,
      colors: {
        body: '#1e112a',
        wood: '#6b21a8',
        handguard: '#9333ea',
        barrel: '#3b0764',
        mag: '#c084fc',
        bulletColor: '#c084fc',
        glow: '#a855f7'
      }
    }
  },
  ump: {
    default: {
      id: 'default',
      weaponId: 'ump',
      name: 'Matte Charcoal',
      tier: 'Common',
      tierColor: '#94a3b8',
      costType: 'free',
      cost: 0,
      colors: {
        body: '#141a24',
        barrel: '#222d3d',
        mag: '#0b0f14',
        rail: '#00f0ff',
        bulletColor: '#00f0ff',
        glow: '#00f0ff'
      }
    },
    ump_synthwave: {
      id: 'ump_synthwave',
      weaponId: 'ump',
      name: 'Synthwave Neon',
      tier: 'Rare',
      tierColor: '#38bdf8',
      costType: 'coins',
      cost: 600,
      colors: {
        body: '#2d0a31',
        barrel: '#ec4899',
        mag: '#06b6d4',
        rail: '#f43f5e',
        bulletColor: '#ec4899',
        glow: '#f43f5e'
      }
    },
    ump_toxic: {
      id: 'ump_toxic',
      weaponId: 'ump',
      name: 'Hazard Toxic',
      tier: 'Rare',
      tierColor: '#38bdf8',
      costType: 'coins',
      cost: 750,
      colors: {
        body: '#272007',
        barrel: '#eab308',
        mag: '#84cc16',
        rail: '#eab308',
        bulletColor: '#84cc16',
        glow: '#eab308'
      }
    },
    ump_ice: {
      id: 'ump_ice',
      weaponId: 'ump',
      name: 'Arctic Frostbite',
      tier: 'Epic',
      tierColor: '#a855f7',
      costType: 'diamonds',
      cost: 180,
      colors: {
        body: '#0c2233',
        barrel: '#38bdf8',
        mag: '#bae6fd',
        rail: '#7dd3fc',
        bulletColor: '#38bdf8',
        glow: '#0284c7'
      }
    }
  },
  mp40: {
    default: {
      id: 'default',
      weaponId: 'mp40',
      name: 'Standard Alloy',
      tier: 'Common',
      tierColor: '#94a3b8',
      costType: 'free',
      cost: 0,
      colors: {
        body: '#111722',
        barrel: '#2a3445',
        mag: '#0f141d',
        stock: '#475569',
        bulletColor: '#ffdd00',
        glow: '#ffdd00'
      }
    },
    mp40_vintage: {
      id: 'mp40_vintage',
      weaponId: 'mp40',
      name: 'Royal Heritage',
      tier: 'Rare',
      tierColor: '#38bdf8',
      costType: 'coins',
      cost: 550,
      colors: {
        body: '#3f200c',
        barrel: '#cbd5e1',
        mag: '#64748b',
        stock: '#ffd700',
        bulletColor: '#ffd700',
        glow: '#ffd700'
      }
    },
    mp40_plasma: {
      id: 'mp40_plasma',
      weaponId: 'mp40',
      name: 'Reactor Core',
      tier: 'Epic',
      tierColor: '#a855f7',
      costType: 'diamonds',
      cost: 200,
      colors: {
        body: '#081d36',
        barrel: '#0284c7',
        mag: '#00f0ff',
        stock: '#38bdf8',
        bulletColor: '#00f0ff',
        glow: '#00f0ff'
      }
    },
    mp40_bloodhound: {
      id: 'mp40_bloodhound',
      weaponId: 'mp40',
      name: 'Bloodhound',
      tier: 'Legendary',
      tierColor: '#f59e0b',
      costType: 'diamonds',
      cost: 300,
      colors: {
        body: '#2d080a',
        barrel: '#991b1b',
        mag: '#ef4444',
        stock: '#b91c1c',
        bulletColor: '#ff0033',
        glow: '#ff0033'
      }
    }
  },
  double_barrel: {
    default: {
      id: 'default',
      weaponId: 'double_barrel',
      name: 'Sawed Steel',
      tier: 'Common',
      tierColor: '#94a3b8',
      costType: 'free',
      cost: 0,
      colors: {
        stock: '#6d3b14',
        body: '#161d28',
        barrel: '#3a4759',
        forend: '#6d3b14',
        bulletColor: '#ff6600',
        glow: '#ff6600'
      }
    },
    double_barrel_hotrod: {
      id: 'double_barrel_hotrod',
      weaponId: 'double_barrel',
      name: 'Hot Rod Flames',
      tier: 'Rare',
      tierColor: '#38bdf8',
      costType: 'coins',
      cost: 700,
      colors: {
        stock: '#7f1d1d',
        body: '#b91c1c',
        barrel: '#ffaa00',
        forend: '#ea580c',
        bulletColor: '#ff4500',
        glow: '#ffaa00'
      }
    },
    double_barrel_damascus: {
      id: 'double_barrel_damascus',
      weaponId: 'double_barrel',
      name: 'Damascus Ripple',
      tier: 'Epic',
      tierColor: '#a855f7',
      costType: 'diamonds',
      cost: 220,
      colors: {
        stock: '#1e293b',
        body: '#475569',
        barrel: '#94a3b8',
        forend: '#334155',
        bulletColor: '#cbd5e1',
        glow: '#94a3b8'
      }
    },
    double_barrel_doom: {
      id: 'double_barrel_doom',
      weaponId: 'double_barrel',
      name: 'Doom Bringer',
      tier: 'Legendary',
      tierColor: '#f59e0b',
      costType: 'diamonds',
      cost: 350,
      colors: {
        stock: '#1c1917',
        body: '#450a0a',
        barrel: '#dc2626',
        forend: '#78350f',
        bulletColor: '#ff1100',
        glow: '#ff4500'
      }
    }
  },
  awm: {
    default: {
      id: 'default',
      weaponId: 'awm',
      name: 'Spec-Ops Navy',
      tier: 'Common',
      tierColor: '#94a3b8',
      costType: 'free',
      cost: 0,
      colors: {
        body: '#2e4a38',
        barrel: '#0d1219',
        brake: '#1f2937',
        scope: '#1e293b',
        optic: '#00f0ff',
        bulletColor: '#00f0ff',
        glow: '#00f0ff'
      }
    },
    awm_hyperbeast: {
      id: 'awm_hyperbeast',
      weaponId: 'awm',
      name: 'Hyper Beast',
      tier: 'Legendary',
      tierColor: '#f59e0b',
      costType: 'diamonds',
      cost: 350,
      colors: {
        body: '#4a044e',
        barrel: '#ec4899',
        brake: '#a855f7',
        scope: '#3b0764',
        optic: '#22c55e',
        bulletColor: '#f43f5e',
        glow: '#ec4899'
      }
    },
    awm_glacier: {
      id: 'awm_glacier',
      weaponId: 'awm',
      name: 'Glacier Frost',
      tier: 'Epic',
      tierColor: '#a855f7',
      costType: 'coins',
      cost: 1100,
      colors: {
        body: '#0369a1',
        barrel: '#38bdf8',
        brake: '#bae6fd',
        scope: '#075985',
        optic: '#e0f2fe',
        bulletColor: '#38bdf8',
        glow: '#0284c7'
      }
    },
    awm_royale: {
      id: 'awm_royale',
      weaponId: 'awm',
      name: '24K Sovereign',
      tier: 'Legendary',
      tierColor: '#f59e0b',
      costType: 'diamonds',
      cost: 450,
      colors: {
        body: '#ffd700',
        barrel: '#b45309',
        brake: '#ffe066',
        scope: '#1c1917',
        optic: '#f59e0b',
        bulletColor: '#ffd700',
        glow: '#ffd700'
      }
    }
  },
  m4a1: {
    default: {
      id: 'default',
      weaponId: 'm4a1',
      name: 'Desert Tan',
      tier: 'Common',
      tierColor: '#94a3b8',
      costType: 'free',
      cost: 0,
      colors: {
        body: '#111827',
        barrel: '#1f2937',
        mag: '#0f172a',
        sight: '#00ffcc',
        bulletColor: '#00ffcc',
        glow: '#00ffcc'
      }
    },
    m4a1_digicamo: {
      id: 'm4a1_digicamo',
      weaponId: 'm4a1',
      name: 'Urban Digital',
      tier: 'Rare',
      tierColor: '#38bdf8',
      costType: 'coins',
      cost: 650,
      colors: {
        body: '#1e3a8a',
        barrel: '#3b82f6',
        mag: '#172554',
        sight: '#60a5fa',
        bulletColor: '#60a5fa',
        glow: '#3b82f6'
      }
    },
    m4a1_valkyrie: {
      id: 'm4a1_valkyrie',
      weaponId: 'm4a1',
      name: 'Celestial Angel',
      tier: 'Legendary',
      tierColor: '#f59e0b',
      costType: 'diamonds',
      cost: 280,
      colors: {
        body: '#f8fafc',
        barrel: '#ffd700',
        mag: '#e2e8f0',
        sight: '#f59e0b',
        bulletColor: '#ffd700',
        glow: '#f59e0b'
      }
    },
    m4a1_cyberneon: {
      id: 'm4a1_cyberneon',
      weaponId: 'm4a1',
      name: 'Neon Runner',
      tier: 'Epic',
      tierColor: '#a855f7',
      costType: 'coins',
      cost: 950,
      colors: {
        body: '#180828',
        barrel: '#d946ef',
        mag: '#06b6d4',
        sight: '#a855f7',
        bulletColor: '#d946ef',
        glow: '#06b6d4'
      }
    }
  },
  deagle: {
    default: {
      id: 'default',
      weaponId: 'deagle',
      name: 'Brushed Silver',
      tier: 'Common',
      tierColor: '#94a3b8',
      costType: 'free',
      cost: 0,
      colors: {
        body: '#334155',
        grip: '#0f172a',
        bore: '#ffaa00',
        bulletColor: '#ffbb00',
        glow: '#ffbb00'
      }
    },
    deagle_gold: {
      id: 'deagle_gold',
      weaponId: 'deagle',
      name: '24K Golden Eagle',
      tier: 'Legendary',
      tierColor: '#f59e0b',
      costType: 'diamonds',
      cost: 320,
      colors: {
        body: '#ffd700',
        grip: '#18181b',
        bore: '#ffe066',
        bulletColor: '#ffd700',
        glow: '#ffd700'
      }
    },
    deagle_crimson: {
      id: 'deagle_crimson',
      weaponId: 'deagle',
      name: 'Crimson Web',
      tier: 'Rare',
      tierColor: '#38bdf8',
      costType: 'coins',
      cost: 700,
      colors: {
        body: '#991b1b',
        grip: '#09090b',
        bore: '#ef4444',
        bulletColor: '#ff2244',
        glow: '#ef4444'
      }
    },
    deagle_vapor: {
      id: 'deagle_vapor',
      weaponId: 'deagle',
      name: 'Vaporwave .50',
      tier: 'Epic',
      tierColor: '#a855f7',
      costType: 'diamonds',
      cost: 160,
      colors: {
        body: '#701a75',
        grip: '#0e7490',
        bore: '#f472b6',
        bulletColor: '#f472b6',
        glow: '#06b6d4'
      }
    }
  },
  p90: {
    default: {
      id: 'default',
      weaponId: 'p90',
      name: 'OD Combat',
      tier: 'Common',
      tierColor: '#94a3b8',
      costType: 'free',
      cost: 0,
      colors: {
        body: '#1e293b',
        mag: '#0284c7',
        grip: '#0f172a',
        sight: '#38bdf8',
        bulletColor: '#33bbff',
        glow: '#33bbff'
      }
    },
    p90_asiimov: {
      id: 'p90_asiimov',
      weaponId: 'p90',
      name: 'Asiimov Mecha',
      tier: 'Epic',
      tierColor: '#a855f7',
      costType: 'coins',
      cost: 900,
      colors: {
        body: '#f1f5f9',
        mag: '#ea580c',
        grip: '#0f172a',
        sight: '#f97316',
        bulletColor: '#ea580c',
        glow: '#f97316'
      }
    },
    p90_galaxy: {
      id: 'p90_galaxy',
      weaponId: 'p90',
      name: 'Galactic Stardust',
      tier: 'Legendary',
      tierColor: '#f59e0b',
      costType: 'diamonds',
      cost: 250,
      colors: {
        body: '#1e1035',
        mag: '#a855f7',
        grip: '#090514',
        sight: '#ec4899',
        bulletColor: '#d946ef',
        glow: '#a855f7'
      }
    }
  }
};

const PERK_DATABASE = [
  {
    id: 'drone_support',
    name: 'Tactical Combat Drone',
    icon: '🛸',
    rarity: 'rare',
    desc: 'Deploys an autonomous companion drone that orbits and fires lasers at nearby hostiles.',
    effect: 'Drone DPS + Laser targeting',
    apply: (p) => { p.drones = (p.drones || 0) + 1; }
  },
  {
    id: 'chain_lightning',
    name: 'Tesla Arc Coil',
    icon: '⚡',
    rarity: 'epic',
    desc: 'Attacks have a 40% chance to arc high-voltage lightning to 4 nearby hostiles.',
    effect: '+40% Chain Lightning chance',
    apply: (p) => { p.chainLightning = (p.chainLightning || 0) + 1; }
  },
  {
    id: 'micro_missiles',
    name: 'Swarm Missile Pod',
    icon: '🚀',
    rarity: 'epic',
    desc: 'Automatically launches 3 heat-seeking micro-missiles every 3.5 seconds.',
    effect: '+3 Homing Missiles volley',
    apply: (p) => { p.missiles = (p.missiles || 0) + 1; }
  },
  {
    id: 'frost_nova',
    name: 'Cryo Frostfield',
    icon: '❄️',
    rarity: 'rare',
    desc: 'Dashing releases a freezing shockwave that slows all nearby enemies by 60% for 3s.',
    effect: 'Dash triggers Frost Shockwave',
    apply: (p) => { p.frostNova = (p.frostNova || 0) + 1; }
  },
  {
    id: 'vampiric_nanites',
    name: 'Vampiric Siphon',
    icon: '🩸',
    rarity: 'epic',
    desc: 'Defeating enemies has a 20% chance to restore 4 HP and 6 Shield instantly.',
    effect: '+20% Lifesteal / Shield chance',
    apply: (p) => { p.lifesteal = (p.lifesteal || 0) + 1; }
  },
  {
    id: 'bouncing_plasma',
    name: 'Ricochet Cartridges',
    icon: '🔁',
    rarity: 'common',
    desc: 'Projectiles ricochet off arena walls and enemies +2 additional times.',
    effect: '+2 Projectile Bounces',
    apply: (p) => { p.bounces = (p.bounces || 0) + 2; }
  },
  {
    id: 'overclock_matrix',
    name: 'Neural Overclock',
    icon: '⏱️',
    rarity: 'rare',
    desc: 'Increases attack fire rate by 25% and reduces all skill cooldowns by 15%.',
    effect: '+25% Fire Rate, -15% Cooldowns',
    apply: (p) => { p.fireRateMult *= 0.8; p.cooldownMult *= 0.85; }
  },
  {
    id: 'titan_shielding',
    name: 'Titan Barrier Matrix',
    icon: '🛡️',
    rarity: 'common',
    desc: 'Increases maximum Shield capacity by +40 and accelerates shield regen by 30%.',
    effect: '+40 Max Shield, +30% Regen',
    apply: (p) => { p.maxShield += 40; p.shield = p.maxShield; p.shieldRegenRate *= 1.3; }
  },
  {
    id: 'hyper_velocity',
    name: 'Kinetic Accelerator',
    icon: '🏃',
    rarity: 'common',
    desc: 'Increases movement speed by 20% and dash distance by 25%.',
    effect: '+20% Move Speed, +25% Dash',
    apply: (p) => { p.speed *= 1.2; p.dashDistanceMult = (p.dashDistanceMult || 1) * 1.25; }
  },
  {
    id: 'critical_surge',
    name: 'Quantum Optics',
    icon: '🎯',
    rarity: 'rare',
    desc: 'Increases Critical Hit Chance by +18% and Critical Damage multiplier by +50%.',
    effect: '+18% Crit Chance, +0.5x Crit Dmg',
    apply: (p) => { p.critChance += 0.18; p.critMult += 0.5; }
  },
  {
    id: 'heavy_caliber',
    name: 'High-Impact Munitions',
    icon: '💥',
    rarity: 'common',
    desc: 'Increases all weapon damage by +25% and adds heavy knockback to attacks.',
    effect: '+25% All Damage, Knockback',
    apply: (p) => { p.damageMult *= 1.25; p.knockbackMult = (p.knockbackMult || 1) + 0.5; }
  },
  {
    id: 'hyper_magnet',
    name: 'Gravity Vacuum',
    icon: '🧲',
    rarity: 'common',
    desc: 'Increases XP orb and credit pickup attraction range by +120%.',
    effect: '+120% Pickup Magnet Radius',
    apply: (p) => { p.magnetRadius *= 2.2; }
  },
  {
    id: 'executioner',
    name: 'Execution Protocol',
    icon: '☠️',
    rarity: 'legendary',
    desc: 'Any non-boss enemy damaged below 25% HP instantly detonates in a cybernetic explosion.',
    effect: 'Instant Execution under 25% HP',
    apply: (p) => { p.executioner = true; }
  },
  {
    id: 'double_tap',
    name: 'Twin-Barrel Splitter',
    icon: '♊',
    rarity: 'legendary',
    desc: 'Primary weapon fires +1 extra projectile per burst in a tight spread.',
    effect: '+1 Additional Projectile',
    apply: (p) => { p.extraProjectiles = (p.extraProjectiles || 0) + 1; }
  },
  {
    id: 'blackhole_core',
    name: 'Singularity Vortex',
    icon: '🌌',
    rarity: 'legendary',
    desc: 'Every 20 kills automatically opens a mini-black hole that pulls and crushes enemies.',
    effect: 'Mini Black Hole every 20 kills',
    apply: (p) => { p.singularityPerk = true; }
  },
  {
    id: 'reactive_armor',
    name: 'Reactive Blast Plating',
    icon: '🧱',
    rarity: 'rare',
    desc: 'Taking damage triggers a powerful radial concussive blast that repels attackers.',
    effect: 'Retaliatory Blast on Hit',
    apply: (p) => { p.reactiveArmor = true; }
  }
];

const CYBERNETICS_MATRIX = [
  { id: 'hp_boost', name: 'Reinforced Endoskeleton', icon: '❤️', desc: '+15 Base HP per tier', baseCost: 100, maxTier: 5, stat: 'hp', bonus: 15 },
  { id: 'shield_boost', name: 'Flux Capacitor Shield', icon: '🛡️', desc: '+12 Base Shield per tier', baseCost: 120, maxTier: 5, stat: 'shield', bonus: 12 },
  { id: 'dmg_boost', name: 'Weapon Calibration', icon: '⚔️', desc: '+6% Global Damage per tier', baseCost: 150, maxTier: 5, stat: 'dmg', bonus: 0.06 },
  { id: 'spd_boost', name: 'Bionic Servos', icon: '👟', desc: '+5% Movement Speed per tier', baseCost: 100, maxTier: 5, stat: 'speed', bonus: 0.05 },
  { id: 'crit_boost', name: 'Targeting Matrix', icon: '🎯', desc: '+3% Crit Chance per tier', baseCost: 180, maxTier: 5, stat: 'crit', bonus: 0.03 },
  { id: 'mag_boost', name: 'Magnetic Core', icon: '🧲', desc: '+25% Magnet Radius per tier', baseCost: 80, maxTier: 5, stat: 'magnet', bonus: 0.25 }
];

const ACHIEVEMENTS_LIST = [
  { id: 'first_blood', title: 'First Hostile Down', desc: 'Eliminate your first cyber hostile.', icon: '🎯', reward: 50 },
  { id: 'combo_20', title: 'Combo Master', desc: 'Reach a 20x kill combo.', icon: '🔥', reward: 150 },
  { id: 'wave_5', title: 'Titan Slayer', desc: 'Defeat the Wave 5 Titan Overlord.', icon: '👑', reward: 300 },
  { id: 'wave_10', title: 'Sector Liberator', desc: 'Conquer Wave 10 and defeat the Core.', icon: '🏆', reward: 600 },
  { id: 'upgrade_max', title: 'Upgraded Legend', desc: 'Max out any Cybernetics upgrade tier.', icon: '🦾', reward: 250 },
  { id: 'kills_500', title: 'Army of One', desc: 'Eliminate 500 total cyber hostiles.', icon: '💀', reward: 400 }
];

// ============================================================================
// PROCEDURAL AUDIO SYNTHESIZER (WEB AUDIO API)
// ============================================================================
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.sfxVol = 0.8;
    this.musicVol = 0.65;
    this.musicPlaying = false;
    this.musicTimer = null;
    this.step = 0;
    this.bpm = 128;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  muteAll() {
    this._prevSfxVol = this.sfxVol;
    this._prevMusicVol = this.musicVol;
    this.sfxVol = 0;
    this.musicVol = 0;
    if (this.ctx && this.ctx.state === 'running') {
      try { this.ctx.suspend(); } catch (e) {}
    }
  }

  unmuteAll() {
    this.sfxVol = this._prevSfxVol !== undefined ? this._prevSfxVol : 0.8;
    this.musicVol = this._prevMusicVol !== undefined ? this._prevMusicVol : 0.65;
    if (this.ctx && this.ctx.state === 'suspended') {
      try { this.ctx.resume(); } catch (e) {}
    }
  }

  playShoot(type = 'ak47') {
    if (!this.ctx || this.sfxVol <= 0) return;
    const now = this.ctx.currentTime;

    if (type === 'shotgun') {
      // Heavy double-barrel blast: Low explosive boom + mid blast crack
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      osc1.connect(gain1); gain1.connect(this.ctx.destination);
      osc2.connect(gain2); gain2.connect(this.ctx.destination);

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(260, now);
      osc1.frequency.exponentialRampToValueAtTime(30, now + 0.28);
      gain1.gain.setValueAtTime(0.55 * this.sfxVol, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(140, now);
      osc2.frequency.exponentialRampToValueAtTime(20, now + 0.35);
      gain2.gain.setValueAtTime(0.4 * this.sfxVol, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc1.start(now); osc1.stop(now + 0.28);
      osc2.start(now); osc2.stop(now + 0.35);
    } else if (type === 'sniper') {
      // Thunderous AWM Magnum Sniper crack + bass punch
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      osc1.connect(gain1); gain1.connect(this.ctx.destination);
      osc2.connect(gain2); gain2.connect(this.ctx.destination);

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(950, now);
      osc1.frequency.exponentialRampToValueAtTime(80, now + 0.38);
      gain1.gain.setValueAtTime(0.55 * this.sfxVol, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.38);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(180, now);
      osc2.frequency.exponentialRampToValueAtTime(25, now + 0.45);
      gain2.gain.setValueAtTime(0.45 * this.sfxVol, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc1.start(now); osc1.stop(now + 0.38);
      osc2.start(now); osc2.stop(now + 0.45);
    } else if (type === 'deagle') {
      // Desert Eagle .50 Hand cannon heavy punch
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.22);
      gain.gain.setValueAtTime(0.45 * this.sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.start(now); osc.stop(now + 0.22);
    } else if (type === 'smg') {
      // Rapid snappy SMG pop (UMP-45, MP-40, P90)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.07);
      gain.gain.setValueAtTime(0.24 * this.sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
      osc.start(now); osc.stop(now + 0.07);
    } else if (type === 'm4a1') {
      // Fast crisp 5.56mm rifle crack
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);
      gain.gain.setValueAtTime(0.28 * this.sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc.start(now); osc.stop(now + 0.09);
    } else {
      // AK-47 7.62mm heavy rifle crack
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);
      gain.gain.setValueAtTime(0.35 * this.sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    }
  }

  playReloadStart() {
    if (!this.ctx || this.sfxVol <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
    gain.gain.setValueAtTime(0.3 * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.start(now); osc.stop(now + 0.12);
  }

  playReloadFinish() {
    if (!this.ctx || this.sfxVol <= 0) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.connect(gain1); gain1.connect(this.ctx.destination);
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(280, now);
    osc1.frequency.exponentialRampToValueAtTime(700, now + 0.08);
    gain1.gain.setValueAtTime(0.35 * this.sfxVol, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
    osc1.start(now); osc1.stop(now + 0.14);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.connect(gain2); gain2.connect(this.ctx.destination);
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(900, now + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(320, now + 0.18);
    gain2.gain.setValueAtTime(0.4 * this.sfxVol, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc2.start(now + 0.06); osc2.stop(now + 0.18);
  }

  playDryFire() {
    if (!this.ctx || this.sfxVol <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
    gain.gain.setValueAtTime(0.25 * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.start(now); osc.stop(now + 0.04);
  }

  playHit(isCrit = false) {
    if (!this.ctx || this.sfxVol <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = isCrit ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isCrit ? 900 : 350, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + (isCrit ? 0.18 : 0.08));
    gain.gain.setValueAtTime((isCrit ? 0.4 : 0.2) * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + (isCrit ? 0.18 : 0.08));
    osc.start(now);
    osc.stop(now + (isCrit ? 0.18 : 0.08));
  }

  playDeflect() {
    if (!this.ctx || this.sfxVol <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(2200, now + 0.15);
    gain.gain.setValueAtTime(0.4 * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playDash() {
    if (!this.ctx || this.sfxVol <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
    gain.gain.setValueAtTime(0.25 * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playExplosion() {
    if (!this.ctx || this.sfxVol <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
    gain.gain.setValueAtTime(0.45 * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playLevelUp() {
    if (!this.ctx || this.sfxVol <= 0) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const now = this.ctx.currentTime + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.3 * this.sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    });
  }

  playVictory() {
    if (!this.ctx || this.sfxVol <= 0) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 triumphant fanfare
    notes.forEach((freq, i) => {
      const now = this.ctx.currentTime + i * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.35 * this.sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  playCoin() {
    if (!this.ctx || this.sfxVol <= 0) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.06);
    gain.gain.setValueAtTime(0.2 * this.sfxVol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playBossAlarm() {
    if (!this.ctx || this.sfxVol <= 0) return;
    for (let i = 0; i < 3; i++) {
      const now = this.ctx.currentTime + i * 0.25;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(650, now + 0.18);
      gain.gain.setValueAtTime(0.35 * this.sfxVol, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  }

  // Dynamic Procedural Synthwave BGM Loop
  startMusic() {
    if (this.musicPlaying) return;
    this.musicPlaying = true;
    this.step = 0;
    const interval = (60 / this.bpm / 4) * 1000; // 16th note timing

    // Bassline and Melody Notes (Cyber minor scale: A minor / D minor)
    const bassline = [110, 110, 110, 110, 130.81, 130.81, 146.83, 146.83, 110, 110, 110, 110, 98.00, 98.00, 123.47, 123.47];
    const melody = [440, 0, 523.25, 0, 659.25, 587.33, 523.25, 0, 440, 659.25, 0, 783.99, 659.25, 0, 523.25, 587.33];

    this.musicTimer = setInterval(() => {
      if (!this.ctx || this.musicVol <= 0 || !this.musicPlaying) return;
      const now = this.ctx.currentTime;
      const beat = this.step % 16;

      // 1. Synthwave Bass
      const bassFreq = bassline[beat];
      if (bassFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, now);
        gain.gain.setValueAtTime(0.12 * this.musicVol, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }

      // 2. Lead Arpeggio
      const melFreq = melody[beat];
      if (melFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(melFreq, now);
        gain.gain.setValueAtTime(0.09 * this.musicVol, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      }

      // 3. Cyber Beat Kick (Every quarter note: beats 0, 4, 8, 12)
      if (beat % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.connect(kickGain);
        kickGain.connect(this.ctx.destination);
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(150, now);
        kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.1);
        kickGain.gain.setValueAtTime(0.22 * this.musicVol, now);
        kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        kickOsc.start(now);
        kickOsc.stop(now + 0.1);
      }

      this.step++;
    }, interval);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

// ============================================================================
// DAILY & WEEKLY MISSIONS DEFINITION
// ============================================================================
const DAILY_MISSIONS_DEF = [
  { id: 'd_wins', name: 'Win 2 Sector Runs', target: 2, rewardCredits: 300, rewardGems: 25, type: 'wins' },
  { id: 'd_kills', name: 'Eliminate 50 Hostiles', target: 50, rewardCredits: 250, rewardGems: 20, type: 'kills' },
  { id: 'd_dash', name: 'Execute 15 Tactical Dashes', target: 15, rewardCredits: 200, rewardGems: 15, type: 'dashes' },
  { id: 'd_credits', name: 'Collect 60 In-Run Credits', target: 60, rewardCredits: 250, rewardGems: 20, type: 'credits' },
  { id: 'd_tactical', name: 'Deploy Tactical Skill 8 Times', target: 8, rewardCredits: 200, rewardGems: 15, type: 'tactical' }
];

const WEEKLY_MISSIONS_DEF = [
  { id: 'w_horde', name: 'Purge 350 Cyber Enemies', target: 350, rewardCredits: 1200, rewardGems: 60, type: 'kills' },
  { id: 'w_bosses', name: 'Defeat 5 Overlord Sector Bosses', target: 5, rewardCredits: 2000, rewardGems: 100, type: 'bosses' },
  { id: 'w_survive', name: 'Survive 12 Minutes in Combat', target: 720, rewardCredits: 1000, rewardGems: 50, type: 'survive_time' },
  { id: 'w_wave', name: 'Reach Wave 10 in a Single Run', target: 10, rewardCredits: 1500, rewardGems: 75, type: 'max_wave' },
  { id: 'w_upgrades', name: 'Install 4 Cybernetics Upgrades', target: 4, rewardCredits: 800, rewardGems: 40, type: 'upgrades' }
];

function getISOWeekString(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

// ============================================================================
// SAVE DATA & PERSISTENCE MANAGER
// ============================================================================
class SaveManager {
  static KEY = 'cyber_survivor_save_v2';

  static getInitialData() {
    return {
      highScore: 0,
      maxWave: 0,
      totalKills: 0,
      maxCombo: 0,
      credits: 700,
      gems: 50,
      googleAccount: null,
      equippedSkins: {
        ak47: 'default',
        ump: 'default',
        mp40: 'default',
        double_barrel: 'default',
        awm: 'default',
        m4a1: 'default',
        deagle: 'default',
        p90: 'default'
      },
      ownedSkins: [
        'default',
        'ak47_default',
        'ump_default',
        'mp40_default',
        'double_barrel_default',
        'awm_default',
        'm4a1_default',
        'deagle_default',
        'p90_default'
      ],
      missions: {
        activeTab: 'daily',
        dailyProgress: {},
        dailyClaimed: {},
        weeklyProgress: {},
        weeklyClaimed: {},
        dailyAdsWatched: 0,
        lastDailyDate: new Date().toDateString(),
        lastWeeklyWeek: getISOWeekString(new Date())
      },
      cybernetics: {
        hp_boost: 0,
        shield_boost: 0,
        dmg_boost: 0,
        spd_boost: 0,
        crit_boost: 0,
        mag_boost: 0
      },
      achievements: [],
      selectedHero: 'commando',
      unlockedHeroes: ['commando'],
      unlockedWeapons: ['ak47', 'ump'],
      primaryWeapon: 'ak47',
      secondaryWeapon: 'ump',
      playerName: 'badhash',
      settings: {
        sfxVol: 80,
        musicVol: 65,
        shake: 100,
        crt: true,
        dmgNumbers: true,
        autoAim: false,
        colorTheme: 'cyber',
        touchMode: 'auto',
        vibrate: true
      }
    };
  }

  static load() {
    try {
      const data = localStorage.getItem(SaveManager.KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const initial = SaveManager.getInitialData();
        const loaded = {
          ...initial,
          ...parsed,
          missions: { ...initial.missions, ...(parsed.missions || {}) },
          cybernetics: { ...initial.cybernetics, ...(parsed.cybernetics || {}) },
          equippedSkins: { ...initial.equippedSkins, ...(parsed.equippedSkins || {}) },
          ownedSkins: parsed.ownedSkins ? Array.from(new Set([...initial.ownedSkins, ...parsed.ownedSkins])) : initial.ownedSkins,
          settings: { ...initial.settings, ...(parsed.settings || {}), autoAim: false }
        };
        if (loaded.gems === undefined || loaded.gems === null) loaded.gems = 50;

        // Ensure unlockedHeroes array exists
        if (!Array.isArray(loaded.unlockedHeroes)) {
          loaded.unlockedHeroes = ['commando'];
        }
        if (loaded.selectedHero && !loaded.unlockedHeroes.includes(loaded.selectedHero)) {
          loaded.unlockedHeroes.push(loaded.selectedHero);
        }

        // Ensure unlockedWeapons array & loadout exist and are valid
        if (!Array.isArray(loaded.unlockedWeapons) || !loaded.unlockedWeapons.includes('ak47')) {
          loaded.unlockedWeapons = ['ak47', 'ump'];
        }
        if (!WEAPON_DEFS[loaded.primaryWeapon]) loaded.primaryWeapon = 'ak47';
        if (!WEAPON_DEFS[loaded.secondaryWeapon]) loaded.secondaryWeapon = 'ump';

        // Check Daily Reset
        const todayStr = new Date().toDateString();
        if (loaded.missions.lastDailyDate !== todayStr) {
          loaded.missions.lastDailyDate = todayStr;
          loaded.missions.dailyProgress = {};
          loaded.missions.dailyClaimed = {};
          loaded.missions.dailyAdsWatched = 0;
        }

        // Check Weekly Reset
        const thisWeekStr = getISOWeekString(new Date());
        if (loaded.missions.lastWeeklyWeek !== thisWeekStr) {
          loaded.missions.lastWeeklyWeek = thisWeekStr;
          loaded.missions.weeklyProgress = {};
          loaded.missions.weeklyClaimed = {};
        }

        return loaded;
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
    return SaveManager.getInitialData();
  }

  static save(data) {
    try {
      localStorage.setItem(SaveManager.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  static reset() {
    localStorage.removeItem(SaveManager.KEY);
  }
}

// ============================================================================
// PARTICLE, LIGHTING & SCORCH MARK SYSTEM
// ============================================================================
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.combatTexts = [];
    this.shockwaves = [];
    this.scorchMarks = [];
  }

  addScorchMark(x, y, radius = 26, color = 'rgba(0, 0, 0, 0.65)') {
    if (this.scorchMarks.length > 70) this.scorchMarks.shift();
    this.scorchMarks.push({
      x, y,
      radius,
      color,
      alpha: 0.85,
      life: 30.0,
      sparks: Math.random() < 0.5
    });
  }

  addSmoke(x, y, color = 'rgba(130, 160, 200, 0.35)', count = 3, speed = 40) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * speed;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: Math.random() * 8 + 6,
        maxSize: Math.random() * 20 + 16,
        life: 1.0,
        decay: Math.random() * 0.9 + 0.6,
        alpha: 0.45,
        type: 'smoke'
      });
    }
  }

  addDustMote(worldW, worldH) {
    if (this.particles.filter(p => p.type === 'dust').length < 35) {
      this.particles.push({
        x: Math.random() * worldW,
        y: Math.random() * worldH,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 18,
        color: 'rgba(0, 240, 255, 0.4)',
        size: Math.random() * 2.5 + 1,
        life: 1.0,
        decay: 0.08,
        alpha: Math.random() * 0.5 + 0.15,
        type: 'dust'
      });
    }
  }

  addSpark(x, y, color = '#00f0ff', count = 8, speed = 180) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: Math.random() * 3.5 + 2,
        life: 1.0,
        decay: Math.random() * 2 + 2,
        alpha: 1.0,
        type: 'spark'
      });
    }
  }

  addBlood(x, y, color = '#ff0055', count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Math.random() * 120 + 30;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: Math.random() * 4 + 2,
        life: 1.0,
        decay: Math.random() * 1.5 + 1.5,
        alpha: 0.9,
        type: 'blood'
      });
    }
  }

  addShellCasing(x, y, angle) {
    const spd = Math.random() * 90 + 110;
    const ejectAngle = angle + (Math.random() - 0.5) * 0.4;
    this.particles.push({
      x, y,
      vx: Math.cos(ejectAngle) * spd,
      vy: Math.sin(ejectAngle) * spd,
      color: '#ffaa00',
      size: 3,
      life: 0.9,
      decay: 1.1,
      alpha: 1.0,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 25,
      type: 'casing'
    });
  }

  addShockwave(x, y, maxRadius = 80, color = '#00f0ff', duration = 0.35) {
    this.shockwaves.push({
      x, y,
      radius: 5,
      maxRadius,
      color,
      life: 1.0,
      decay: 1 / duration
    });
  }

  addCombatText(x, y, text, color = '#ffffff', isCrit = false) {
    this.combatTexts.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y - 10,
      text,
      color,
      isCrit,
      size: isCrit ? 24 : 14,
      life: 1.0,
      vy: isCrit ? -70 : -45
    });
  }

  update(dt) {
    // Update scorch marks
    for (let i = this.scorchMarks.length - 1; i >= 0; i--) {
      const sm = this.scorchMarks[i];
      sm.life -= dt;
      sm.alpha = Math.max(0, (sm.life / 30.0) * 0.85);
      if (sm.life <= 0) this.scorchMarks.splice(i, 1);
    }

    // Update regular particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      if (p.type === 'casing') {
        p.rotation = (p.rotation || 0) + (p.vRot || 5) * dt;
      }
      if (p.type === 'smoke') {
        p.size += (p.maxSize - p.size) * (2 * dt);
      }
      p.life -= p.decay * dt;
      p.alpha = Math.max(0, p.life * (p.type === 'smoke' ? 0.45 : (p.type === 'dust' ? 0.5 : 1.0)));
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life -= sw.decay * dt;
      sw.radius += (sw.maxRadius - sw.radius) * (15 * dt);
      if (sw.life <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update combat text
    for (let i = this.combatTexts.length - 1; i >= 0; i--) {
      const ct = this.combatTexts[i];
      ct.y += ct.vy * dt;
      ct.life -= 1.4 * dt;
      if (ct.life <= 0) {
        this.combatTexts.splice(i, 1);
      }
    }
  }

  drawScorchMarks(ctx, camera) {
    for (const sm of this.scorchMarks) {
      const sx = sm.x - camera.x;
      const sy = sm.y - camera.y;
      if (sx < -100 || sx > camera.width + 100 || sy < -100 || sy > camera.height + 100) continue;

      ctx.save();
      ctx.globalAlpha = sm.alpha;
      // Charred crater
      ctx.fillStyle = '#060810';
      ctx.beginPath();
      ctx.arc(sx, sy, sm.radius, 0, Math.PI * 2);
      ctx.fill();

      // Glowing outer rim
      ctx.strokeStyle = 'rgba(255, 100, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, sm.radius * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  draw(ctx, camera) {
    // Shockwaves
    for (const sw of this.shockwaves) {
      const sx = sw.x - camera.x;
      const sy = sw.y - camera.y;
      ctx.save();
      ctx.beginPath();
      ctx.arc(sx, sy, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color;
      ctx.globalAlpha = Math.max(0, sw.life * 0.85);
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 15;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      ctx.restore();
    }

    // Particles & Shell Casings
    for (const p of this.particles) {
      const px = p.x - camera.x;
      const py = p.y - camera.y;
      if (px < -50 || px > camera.width + 50 || py < -50 || py > camera.height + 50) continue;

      if (p.type === 'casing') {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.rotation || 0);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#ffaa00';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 4;
        ctx.fillRect(-3, -1.5, 6, 3);
        ctx.restore();
        continue;
      }

      if (p.type === 'smoke') {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Combat Texts
    for (const ct of this.combatTexts) {
      const tx = ct.x - camera.x;
      const ty = ct.y - camera.y;
      ctx.save();
      ctx.globalAlpha = Math.max(0, ct.life);
      ctx.font = `${ct.isCrit ? '900' : '700'} ${ct.size}px 'Orbitron', sans-serif`;
      ctx.fillStyle = ct.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = ct.color;
      ctx.shadowBlur = ct.isCrit ? 16 : 6;
      ctx.fillText(ct.text, tx, ty);
      ctx.restore();
    }
  }

  clear() {
    this.particles = [];
    this.combatTexts = [];
    this.shockwaves = [];
    this.scorchMarks = [];
  }
}

// ============================================================================
// MAIN GAME APPLICATION
// ============================================================================
class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas') || document.getElementById('gameCanvas') || document.querySelector('canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.saveData = SaveManager.load();
    this.audio = new AudioEngine();
    this.particles = new ParticleSystem();

    // Game state
    this.state = 'MENU'; // MENU, PLAYING, PAUSED, LEVELUP, GAMEOVER, VICTORY
    this.gameMode = 'campaign'; // campaign, endless, bossrush
    this.selectedHero = this.saveData.selectedHero || 'commando';

    // World & Camera
    this.camera = { x: 0, y: 0, width: 0, height: 0, shakeTrauma: 0 };
    this.resizeCanvas();

    // Input state
    this.keys = {};
    this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, isDown: false, rightDown: false };
    this.touchJoystick = { active: false, startX: 0, startY: 0, curX: 0, curY: 0, dx: 0, dy: 0 };
    this.autoAimEnabled = this.saveData.settings.autoAim;

    // Entities
    this.player = null;
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.enemies = [];
    this.pickups = [];
    this.hazards = [];

    // Wave Director & Boss
    this.wave = 1;
    this.waveTimer = 0;
    this.waveDuration = 35; // 35 seconds per wave
    this.spawnTimer = 0;
    this.activeBoss = null;
    this.runScore = 0;
    this.runKills = 0;
    this.runCredits = 0;
    this.runTime = 0;

    // Combo system
    this.comboCount = 0;
    this.comboTimer = 0;
    this.comboMaxTime = 4.5;

    // Level up draft
    this.rerollsLeft = 1;
    this.offeredPerks = [];

    // 4-Player Real-Time Co-Op & PeerJS Match State
    this.isPrivateMatch = false;
    this.isHost = false;
    this.roomCode = null;
    this.mySlot = 1;
    this.peer = null;
    this.hostConn = null;
    this.squadPeers = new Map(); // peerId -> client peer object
    this.squadMembers = []; // all connected human players in match
    this.roomCodePrefix = 'cyber_survivor_squad_';
    this.teammate = null; // AI bot completely disabled
    this.netChannel = null;
    this.localNetChannel = null;
    this.networkId = null;
    this.networkSyncTimer = 0;
    this.isTouchReviving = false;
    this.isAdShowing = false;

    // Register Google H5 Games Ads Game Hooks (Pause Loop & Mute Audio)
    if (window.AdManager) {
      window.AdManager.setGameHooks({
        onAdStart: () => this.onAdStart(),
        onAdEnd: () => this.onAdEnd()
      });
    }

    // Register Google Identity Services Auth Hooks (Encapsulated without window leaks)
    if (window.AuthManager && typeof window.AuthManager.setGameAuthHandler === 'function') {
      window.AuthManager.setGameAuthHandler({
        onUserLogin: (user) => {
          this.saveData.googleAccount = {
            id: user.id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            avatar: user.picture ? null : '🎮',
            cloudSynced: true,
            lastSync: user.lastSync || new Date().toLocaleTimeString()
          };
          if (user.name) {
            this.saveData.playerName = user.name;
            const stageName = document.getElementById('stage-player-name');
            if (stageName) stageName.textContent = user.name;
            const inputName = document.getElementById('input-google-name');
            if (inputName) inputName.value = user.name;
          }
          SaveManager.save(this.saveData);
          this.updateHeroPreview();
          this.showGoogleAuthModalState();
          if (this.audio && typeof this.audio.playLevelUp === 'function') {
            this.audio.playLevelUp();
          }
          this.showNotification(`Authenticated via Google: ${user.email}`, 'GOOGLE CLOUD CONNECTED', 'green');
        },
        onUserLogout: () => {
          this.saveData.googleAccount = null;
          SaveManager.save(this.saveData);
          this.updateHeroPreview();
          this.showGoogleAuthModalState();
          if (this.audio && typeof this.audio.playDeflect === 'function') {
            this.audio.playDeflect();
          }
          this.showNotification('Google Account unlinked. Local save active.', 'SIGNED OUT', 'red');
        },
        onCloudSync: () => {
          if (this.saveData?.googleAccount) {
            this.saveData.googleAccount.lastSync = new Date().toLocaleTimeString();
            SaveManager.save(this.saveData);
            const timeEl = document.getElementById('google-last-sync-time');
            if (timeEl) timeEl.textContent = `Last sync: ${this.saveData.googleAccount.lastSync}`;
            if (this.audio && typeof this.audio.playLevelUp === 'function') {
              this.audio.playLevelUp();
            }
            this.showNotification('All progress, diamonds, and loadouts synced to Google Cloud.', 'CLOUD SYNC COMPLETE', 'green');
          }
        },
        getGoogleAccount: () => this.saveData?.googleAccount || null
      });
    }

    // Bindings
    this.selectedInspectWeapon = this.saveData.primaryWeapon || 'ak47';
    this.initEvents();
    this.applySettingsUI();
    this.renderCyberneticsUI();
    this.renderRecordsUI();
    this.renderAchievementsUI();
    this.renderMissionsUI();
    this.updateAdQuotaUI();
    this.renderWeeklyBundleUI();
    this.renderHeroesGridUI();
    this.renderWeaponsGridUI();
    this.updateWeaponInspectPreview();
    this.updateHeroPreview();
    this.updateLobbyLoadoutSlots();
    this.initChallengeTimer();

    // Game Loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  onAdStart() {
    this.isAdShowing = true;
    if (this.audio) {
      this.audio.muteAll();
    }
    if (window.AdManager && typeof window.AdManager.cleanupAccessibilityBlocks === 'function') {
      window.AdManager.cleanupAccessibilityBlocks();
    }
  }

  resetAdUIOverlays() {
    if (this.adTimerInterval) {
      clearInterval(this.adTimerInterval);
      this.adTimerInterval = null;
    }
    const rewardedModal = document.getElementById('rewarded-ad-modal');
    if (rewardedModal) rewardedModal.classList.add('hidden');

    const hubModal = document.getElementById('earn-diamonds-modal');
    if (hubModal) hubModal.classList.add('hidden');

    const claimBtn = document.getElementById('btn-claim-ad-reward');
    if (claimBtn) {
      claimBtn.disabled = false;
      claimBtn.classList.remove('disabled');
      claimBtn.innerHTML = '<span>💎 CLAIM +25 DIAMONDS NOW!</span>';
    }

    const progressBar = document.getElementById('ad-progress-bar');
    if (progressBar) progressBar.style.width = '100%';
  }

  onAdEnd() {
    this.isAdShowing = false;
    this.resetAdUIOverlays();
    if (this.audio) {
      this.audio.unmuteAll();
    }
    if (window.AdManager && typeof window.AdManager.cleanupAccessibilityBlocks === 'function') {
      window.AdManager.cleanupAccessibilityBlocks();
    }
  }

  initChallengeTimer() {
    const updateTimer = () => {
      const now = new Date();
      const isDaily = (this.saveData.missions?.activeTab !== 'weekly');
      const el = document.getElementById('challenge-timer-text');
      if (!el) return;

      if (isDaily) {
        // Time until midnight
        const tomorrow = new Date(now);
        tomorrow.setHours(24, 0, 0, 0);
        const diffMs = Math.max(0, tomorrow - now);
        const diffSecs = Math.floor(diffMs / 1000);
        const h = Math.floor(diffSecs / 3600);
        const m = Math.floor((diffSecs % 3600) / 60);
        const s = diffSecs % 60;
        el.textContent = `${h}h ${m}m ${s}s`;
      } else {
        // Time until next Monday
        const d = new Date(now);
        const day = d.getDay();
        const diffDays = (7 - day + 1) % 7 || 7;
        const nextMon = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffDays, 0, 0, 0);
        const diffMs = Math.max(0, nextMon - now);
        const diffDaysTotal = Math.floor(diffMs / (86400 * 1000));
        const diffSecs = Math.floor((diffMs % (86400 * 1000)) / 1000);
        const h = Math.floor(diffSecs / 3600);
        const m = Math.floor((diffSecs % 3600) / 60);
        el.textContent = `${diffDaysTotal}d ${h}h ${m}m`;
      }

      this.updateWeeklyBundleCountdown();
    };
    updateTimer();
    if (this.challengeTimerInterval) clearInterval(this.challengeTimerInterval);
    this.challengeTimerInterval = setInterval(updateTimer, 1000);
  }

  resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth || document.documentElement.clientWidth || 1280;
    const h = window.innerHeight || document.documentElement.clientHeight || 720;
    if (this.canvas) {
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
      if (this.ctx) {
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }
    this.camera.width = w;
    this.camera.height = h;
  }

  initEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.audio.init();

      // Ensure gameplay takes focus and active input boxes do not capture game keys
      if (this.state === 'PLAYING') {
        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
          document.activeElement.blur();
          window.focus();
        }
      }

      this.keys[e.code] = true;
      if (e.key) {
        this.keys[e.key] = true;
        this.keys[e.key.toLowerCase()] = true;
        this.keys[e.key.toUpperCase()] = true;
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.state === 'PLAYING') this.pauseGame();
        else if (this.state === 'PAUSED') this.resumeGame();
      }
      if (this.state === 'PLAYING') {
        if (e.code === 'Digit1') {
          e.preventDefault();
          this.switchWeapon(1);
        }
        if (e.code === 'Digit2') {
          e.preventDefault();
          this.switchWeapon(2);
        }
        if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          this.reloadWeapon();
        }
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
          e.preventDefault();
          this.triggerDash();
        }
        if (e.code === 'KeyQ' || e.key === 'q' || e.key === 'Q') {
          e.preventDefault();
          this.triggerSpecialSkill();
        }
        if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          this.triggerUltimate();
        }
        if (e.code === 'KeyF' || e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          this.keys['KeyF'] = true;
        }
      }
    });

    window.addEventListener('wheel', () => {
      if (this.state === 'PLAYING' && this.player) {
        const nextSlot = this.player.activeWeaponSlot === 1 ? 2 : 1;
        this.switchWeapon(nextSlot);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.key) {
        this.keys[e.key] = false;
        this.keys[e.key.toLowerCase()] = false;
        this.keys[e.key.toUpperCase()] = false;
      }
    });

    // Mouse
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.worldX = this.camera.x + e.clientX;
      this.mouse.worldY = this.camera.y + e.clientY;
    });

    window.addEventListener('mousedown', (e) => {
      this.audio.init();
      if (e.button === 0) this.mouse.isDown = true;
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.isDown = false;
    });

    window.addEventListener('contextmenu', (e) => e.preventDefault());

    // Mobile Touch Aiming on Canvas (Right-side touch drag)
    window.addEventListener('touchstart', (e) => {
      this.audio.init();
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        if (touch.clientX > window.innerWidth * 0.4) {
          this.mouse.x = touch.clientX;
          this.mouse.y = touch.clientY;
          this.mouse.worldX = this.camera.x + touch.clientX;
          this.mouse.worldY = this.camera.y + touch.clientY;
        }
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        if (touch.clientX > window.innerWidth * 0.4) {
          this.mouse.x = touch.clientX;
          this.mouse.y = touch.clientY;
          this.mouse.worldX = this.camera.x + touch.clientX;
          this.mouse.worldY = this.camera.y + touch.clientY;
        }
      }
    }, { passive: true });

    // Touch Virtual Joystick
    const joystickZone = document.getElementById('joystick-zone');
    const joystickStick = document.getElementById('joystick-stick');
    if (joystickZone) {
      const handleTouch = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = joystickZone.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = rect.width / 2;
        const angle = Math.atan2(dy, dx);
        const clampedDist = Math.min(dist, maxDist);

        this.touchJoystick.dx = (Math.cos(angle) * clampedDist) / maxDist;
        this.touchJoystick.dy = (Math.sin(angle) * clampedDist) / maxDist;
        this.touchJoystick.active = true;

        if (joystickStick) {
          joystickStick.style.transform = `translate(${Math.cos(angle) * clampedDist}px, ${Math.sin(angle) * clampedDist}px)`;
        }
      };

      joystickZone.addEventListener('touchstart', handleTouch);
      joystickZone.addEventListener('touchmove', handleTouch);
      const resetJoystick = () => {
        this.touchJoystick.active = false;
        this.touchJoystick.dx = 0;
        this.touchJoystick.dy = 0;
        if (joystickStick) joystickStick.style.transform = 'translate(0, 0)';
      };
      joystickZone.addEventListener('touchend', resetJoystick);
      joystickZone.addEventListener('touchcancel', resetJoystick);
    }

    // Touch Action Buttons
    const btnTouchFire = document.getElementById('touch-btn-fire');
    if (btnTouchFire) {
      btnTouchFire.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.mouse.isDown = true;
        this.vibrate(15);
      });
      btnTouchFire.addEventListener('touchend', () => { this.mouse.isDown = false; });
    }
    const btnTouchDash = document.getElementById('touch-btn-dash');
    if (btnTouchDash) btnTouchDash.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.triggerDash();
      this.vibrate(25);
    });
    const btnTouchSkill = document.getElementById('touch-btn-skill');
    if (btnTouchSkill) btnTouchSkill.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.triggerSpecialSkill();
      this.vibrate(30);
    });
    const btnTouchUlt = document.getElementById('touch-btn-ult');
    if (btnTouchUlt) btnTouchUlt.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.triggerUltimate();
      this.vibrate([40, 30, 60]);
    });

    // UI Buttons & Tabs
    document.querySelectorAll('.nav-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.audio.playShoot('psionic');
        document.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        const pane = document.getElementById(tab.dataset.tab);
        if (pane) pane.classList.add('active');

        // Dynamically refresh and synchronize tab views
        if (tab.dataset.tab === 'tab-cybernetics') {
          this.renderCyberneticsUI();
        } else if (tab.dataset.tab === 'tab-records') {
          this.renderRecordsUI();
          this.renderAchievementsUI();
        } else if (tab.dataset.tab === 'tab-heroes') {
          this.renderHeroesGridUI();
          this.updateHeroPreview();
        } else if (tab.dataset.tab === 'tab-weapons') {
          this.renderWeaponsGridUI();
          this.updateWeaponInspectPreview();
        } else if (tab.dataset.tab === 'tab-play') {
          this.renderMissionsUI();
          this.updateHeroPreview();
        }
        this.updateAllCurrencyDisplays();
      });
    });

    // Topbar Currency Quick-Buy Buttons
    document.getElementById('btn-buy-coins')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.switchTab('tab-store');
    });
    document.getElementById('btn-buy-gems')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openEarnDiamondsHub();
    });

    // In-Game Bank Store Pack Purchases (Coins & Diamonds)
    document.querySelectorAll('.btn-buy-pack').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.disabled || btn.classList.contains('claimed')) {
          this.showNotification('This bundle has already been claimed for this week!', 'ALREADY CLAIMED', 'amber');
          return;
        }
        const pack = {
          id: btn.dataset.packId,
          name: btn.dataset.name,
          costType: btn.dataset.costType || 'coins',
          cost: parseInt(btn.dataset.cost || '0', 10),
          gems: parseInt(btn.dataset.gems || '0', 10),
          coins: parseInt(btn.dataset.coins || '0', 10),
          skin: btn.dataset.skin || null,
          weaponId: btn.dataset.weaponId || 'ak47',
          skinName: btn.dataset.skinName || '',
          weekKey: btn.dataset.weekKey || null
        };
        this.openBankPurchaseModal(pack);
      });
    });

    // Diamond to Coin Exchange Actions
    document.querySelectorAll('.btn-exchange-action').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const costGems = parseInt(btn.dataset.costGems, 10);
        const getCoins = parseInt(btn.dataset.getCoins, 10);
        this.convertDiamondsToCoins(costGems, getCoins);
      });
    });

    // Bank Purchase Confirmation Modal Listeners
    document.getElementById('btn-close-buy-modal')?.addEventListener('click', () => {
      document.getElementById('bank-purchase-modal')?.classList.add('hidden');
    });
    document.getElementById('btn-cancel-buy-modal')?.addEventListener('click', () => {
      document.getElementById('bank-purchase-modal')?.classList.add('hidden');
    });
    document.getElementById('btn-confirm-in-game-purchase')?.addEventListener('click', () => {
      if (this.pendingBankPack) {
        this.confirmBankPurchase(this.pendingBankPack);
      }
    });
    document.getElementById('bank-purchase-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'bank-purchase-modal') {
        document.getElementById('bank-purchase-modal')?.classList.add('hidden');
      }
    });

    // Watch Ad Triggers (Lobby, Bank, Hub)
    document.getElementById('btn-watch-ad-lobby')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startRewardedAd();
    });
    document.getElementById('btn-watch-ad-store')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startRewardedAd();
    });
    document.getElementById('btn-launch-ad-from-hub')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startRewardedAd();
    });
    document.getElementById('btn-claim-ad-reward')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.claimAdReward();
    });
    document.getElementById('btn-close-ad')?.addEventListener('click', () => {
      if (this.adTimerInterval) clearInterval(this.adTimerInterval);
      document.getElementById('rewarded-ad-modal')?.classList.add('hidden');
    });

    // Earn Diamonds Hub Listeners
    document.getElementById('btn-close-earn-modal')?.addEventListener('click', () => {
      document.getElementById('earn-diamonds-modal')?.classList.add('hidden');
    });
    document.getElementById('earn-diamonds-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'earn-diamonds-modal') {
        document.getElementById('earn-diamonds-modal')?.classList.add('hidden');
      }
    });
    document.getElementById('btn-goto-missions-hub')?.addEventListener('click', () => {
      document.getElementById('earn-diamonds-modal')?.classList.add('hidden');
      this.switchTab('tab-play');
    });
    document.getElementById('btn-goto-missions-store')?.addEventListener('click', () => {
      this.switchTab('tab-play');
    });
    document.getElementById('btn-goto-exchange-hub')?.addEventListener('click', () => {
      document.getElementById('earn-diamonds-modal')?.classList.add('hidden');
      this.switchTab('tab-store');
    });

    // Weapon Loadout Buttons
    document.getElementById('btn-equip-primary')?.addEventListener('click', () => {
      this.equipWeapon(this.selectedInspectWeapon, 1);
    });

    document.getElementById('btn-equip-secondary')?.addEventListener('click', () => {
      this.equipWeapon(this.selectedInspectWeapon, 2);
    });

    document.getElementById('hud-weap-slot-1')?.addEventListener('click', () => this.switchWeapon(1));
    document.getElementById('hud-weap-slot-2')?.addEventListener('click', () => this.switchWeapon(2));
    document.getElementById('btn-hud-reload')?.addEventListener('click', () => this.reloadWeapon());
    document.getElementById('touch-btn-reload')?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.reloadWeapon();
      this.vibrate(20);
    });
    const btnTouchRevive = document.getElementById('touch-btn-revive');
    if (btnTouchRevive) {
      btnTouchRevive.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.keys['KeyF'] = true;
        this.isTouchReviving = true;
        this.vibrate(25);
      });
      btnTouchRevive.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.keys['KeyF'] = false;
        this.isTouchReviving = false;
      });
    }
    document.getElementById('touch-btn-switch-weap')?.addEventListener('click', () => {
      if (this.player) {
        const nextSlot = this.player.activeWeaponSlot === 1 ? 2 : 1;
        this.switchWeapon(nextSlot);
      }
    });

    // DEADSHOT.io Mode Pills
    document.querySelectorAll('.mode-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        this.audio.playDeflect();
        document.querySelectorAll('.mode-pill').forEach((p) => p.classList.remove('selected'));
        pill.classList.add('selected');
        this.gameMode = pill.dataset.mode || 'campaign';
      });
    });

    // Main Lobby Loadout / Equipment Slots (+ buttons flanking character)
    const handleLoadoutSlotClick = (slotNumber) => {
      this.audio.playDeflect();
      // 1. Immediately trigger navigation to WEAPONS tab
      this.switchTab('tab-weapons');
      const navWeap = document.getElementById('nav-weapons');
      if (navWeap) navWeap.click();

      // 2. Add visual UI indicator/banner stating: 'Select a weapon to equip in this slot'
      const banner = document.getElementById('weapon-equip-hint-banner');
      if (banner) {
        banner.classList.remove('hidden');
        const text = banner.querySelector('.we-hint-text');
        if (text) {
          text.textContent = `Select a weapon to equip in Slot [${slotNumber}]`;
        }
      }

      this.showNotification(`Select a weapon to equip in Slot [${slotNumber}]`, 'LOADOUT ARMORY', 'cyan');
    };

    const slotPrim = document.getElementById('slot-weapon-primary') || document.getElementById('btn-prev-hero');
    const slotSec = document.getElementById('slot-weapon-secondary') || document.getElementById('btn-next-hero');

    if (slotPrim) {
      slotPrim.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLoadoutSlotClick(1);
      });
    }

    if (slotSec) {
      slotSec.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleLoadoutSlotClick(2);
      });
    }

    // Also support any element with .equipment-slot
    document.querySelectorAll('.equipment-slot').forEach((slotEl) => {
      slotEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const slotNum = parseInt(slotEl.dataset.slot || '1', 10);
        handleLoadoutSlotClick(slotNum);
      });
    });

    // Enter shop cta
    document.querySelectorAll('.btn-goto-shop').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelector('.nav-tab[data-tab="tab-cybernetics"]')?.click();
      });
    });

    // Username editing
    const playerNameInput = document.getElementById('topbar-player-name');
    if (playerNameInput) {
      playerNameInput.addEventListener('blur', () => {
        const val = playerNameInput.textContent.trim() || 'badhash';
        this.saveData.playerName = val;
        SaveManager.save(this.saveData);
        this.updateHeroPreview();
      });
    }

    // Google Account & Profile Modal Events
    document.getElementById('btn-profile-account')?.addEventListener('click', () => {
      this.showGoogleAuthModalState();
      if (window.AuthManager) window.AuthManager.renderGisButton();
      document.getElementById('google-auth-modal')?.classList.remove('hidden');
      this.audio.playDeflect();
    });

    document.getElementById('topbar-hero-avatar')?.parentElement?.addEventListener('click', () => {
      this.showGoogleAuthModalState();
      if (window.AuthManager) window.AuthManager.renderGisButton();
      document.getElementById('google-auth-modal')?.classList.remove('hidden');
      this.audio.playDeflect();
    });

    document.getElementById('btn-close-google-modal')?.addEventListener('click', () => {
      document.getElementById('google-auth-modal')?.classList.add('hidden');
    });

    document.getElementById('google-auth-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'google-auth-modal') {
        document.getElementById('google-auth-modal')?.classList.add('hidden');
      }
    });

    // Google Identity Services Sign-In Trigger
    document.getElementById('btn-google-login-action')?.addEventListener('click', () => {
      if (window.AuthManager) {
        window.AuthManager.signIn();
      }
    });

    // Google Sign-Out
    document.getElementById('btn-google-signout-action')?.addEventListener('click', () => {
      if (window.AuthManager) {
        window.AuthManager.signOut();
      } else {
        this.saveData.googleAccount = null;
        SaveManager.save(this.saveData);
        this.updateHeroPreview();
        this.showGoogleAuthModalState();
        this.showNotification('Google Account unlinked. Local save active.', 'SIGNED OUT', 'red');
        this.audio.playDeflect();
      }
    });

    // Google Cloud Save Sync
    document.getElementById('btn-google-sync-now')?.addEventListener('click', () => {
      if (window.AuthManager) {
        window.AuthManager.syncCloudSave();
      } else {
        SaveManager.save(this.saveData);
        this.showNotification('All missions, currencies, and upgrades synced to Google Cloud.', 'CLOUD SYNC COMPLETE', 'green');
        this.audio.playLevelUp();
      }
    });

    document.getElementById('btn-reset-data-top')?.addEventListener('click', () => {
      if (this.saveData.googleAccount) {
        document.getElementById('btn-google-signout-action')?.click();
      } else {
        document.getElementById('btn-reset-data')?.click();
      }
    });

    // Daily / Weekly Missions Tabs
    document.getElementById('btn-tab-daily')?.addEventListener('click', () => {
      if (!this.saveData.missions) this.saveData.missions = {};
      this.saveData.missions.activeTab = 'daily';
      document.getElementById('btn-tab-daily')?.classList.add('active');
      document.getElementById('btn-tab-weekly')?.classList.remove('active');
      SaveManager.save(this.saveData);
      this.audio.playDeflect();
      this.renderMissionsUI();
      this.initChallengeTimer();
    });

    document.getElementById('btn-tab-weekly')?.addEventListener('click', () => {
      if (!this.saveData.missions) this.saveData.missions = {};
      this.saveData.missions.activeTab = 'weekly';
      document.getElementById('btn-tab-weekly')?.classList.add('active');
      document.getElementById('btn-tab-daily')?.classList.remove('active');
      SaveManager.save(this.saveData);
      this.audio.playDeflect();
      this.renderMissionsUI();
      this.initChallengeTimer();
    });

    // Lobby Mode Selector Pills (Solo, CO-OP Squad 4P, Boss Gauntlet)
    const selectModePill = (mode, el) => {
      document.querySelectorAll('.mode-pill').forEach((p) => p.classList.remove('selected', 'active'));
      el?.classList.add('selected', 'active');
      this.gameMode = mode;
      this.audio.playDeflect();
    };

    document.getElementById('btn-mode-campaign')?.addEventListener('click', (e) => {
      selectModePill('campaign', e.currentTarget);
      this.isPrivateMatch = false;
      this.showNotification('Solo Survival mode active. Click PLAY to start.', 'SOLO MISSION', 'green');
    });

    document.getElementById('btn-mode-coop-squad')?.addEventListener('click', (e) => {
      selectModePill('coop', e.currentTarget);
      this.openSquadLobbyModal('create');
    });

    document.getElementById('btn-mode-private')?.addEventListener('click', (e) => {
      selectModePill('coop', e.currentTarget);
      this.openSquadLobbyModal('create');
    });

    document.getElementById('btn-mode-join')?.addEventListener('click', (e) => {
      selectModePill('coop', e.currentTarget);
      this.openSquadLobbyModal('join');
    });

    // 4-Player Squad Modal Tab & Button Listeners
    document.getElementById('btn-close-squad-modal')?.addEventListener('click', () => {
      this.closeSquadLobbyModal();
    });

    document.getElementById('squad-lobby-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'squad-lobby-modal') {
        this.closeSquadLobbyModal();
      }
    });

    document.getElementById('tab-btn-create-squad')?.addEventListener('click', () => {
      this.switchSquadLobbyTab('create');
    });

    document.getElementById('tab-btn-join-squad')?.addEventListener('click', () => {
      this.switchSquadLobbyTab('join');
    });

    document.getElementById('btn-copy-squad-code')?.addEventListener('click', () => {
      const code = document.getElementById('squad-generated-code')?.textContent || this.roomCode || 'CYBER-42X';
      navigator.clipboard?.writeText(code).then(() => {
        this.showNotification(`Room code ${code} copied! Share it with teammates.`, 'ROOM CODE COPIED', 'green');
      }).catch(() => {
        this.showNotification(`Room code: ${code}`, 'ROOM CODE', 'green');
      });
      this.audio.playCoin();
    });

    document.getElementById('btn-start-squad-match')?.addEventListener('click', () => {
      this.launchSquadMatch();
    });

    document.getElementById('btn-connect-squad')?.addEventListener('click', () => {
      const input = document.getElementById('input-join-squad-code');
      const code = input ? input.value.trim() : '';
      if (!code) {
        this.showNotification('Please enter a 5-character room code!', 'CODE REQUIRED', 'red');
        this.audio.playHit(false);
        return;
      }
      this.joinSquadRoom(code);
    });

    document.getElementById('input-join-squad-code')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('btn-connect-squad')?.click();
      }
    });

    document.getElementById('btn-mode-bossrush')?.addEventListener('click', (e) => {
      selectModePill('bossrush', e.currentTarget);
      this.isPrivateMatch = false;
      this.showNotification('Boss Gauntlet mode active! Click PLAY to deploy.', 'BOSS GAUNTLET READY', 'green');
    });

    document.querySelectorAll('.mode-card').forEach((card) => {
      card.addEventListener('click', () => {
        this.audio.playDeflect();
        document.querySelectorAll('.mode-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        this.gameMode = card.dataset.mode;
      });
    });

    document.querySelectorAll('.hero-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const heroId = card.dataset.hero;
        const isAlreadySelected = (this.selectedHero === heroId);
        const clickedBtn = e.target.closest('.btn-hero-select');

        if (isAlreadySelected && clickedBtn) {
          // Clicking equipped button directly launches the mission!
          this.startRun();
          return;
        }

        this.selectedHero = heroId;
        this.saveData.selectedHero = this.selectedHero;
        SaveManager.save(this.saveData);
        this.audio.playDeflect();
        this.updateHeroPreview();
      });

      card.addEventListener('dblclick', () => {
        this.selectedHero = card.dataset.hero;
        this.saveData.selectedHero = this.selectedHero;
        SaveManager.save(this.saveData);
        this.startRun();
      });
    });

    document.getElementById('btn-hero-launch')?.addEventListener('click', () => this.startRun());
    document.getElementById('btn-hero-back')?.addEventListener('click', () => {
      document.querySelector('.nav-tab[data-tab="tab-play"]')?.click();
    });

    document.querySelectorAll('.btn-goto-play').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelector('.nav-tab[data-tab="tab-play"]')?.click();
      });
    });

    document.getElementById('btn-switch-hero')?.addEventListener('click', () => {
      document.querySelector('.nav-tab[data-tab="tab-heroes"]')?.click();
    });

    document.getElementById('btn-lab-buy-more')?.addEventListener('click', () => {
      this.switchTab('tab-store');
    });

    document.getElementById('btn-store-goto-weapons')?.addEventListener('click', () => {
      this.switchTab('tab-weapons');
    });

    document.getElementById('btn-start-game')?.addEventListener('click', () => {
      if (this.gameMode === 'coop') {
        this.openSquadLobbyModal('create');
      } else {
        this.isPrivateMatch = false;
        this.startRun();
      }
    });
    document.getElementById('btn-pause')?.addEventListener('click', () => this.pauseGame());
    document.getElementById('btn-resume-game')?.addEventListener('click', () => this.resumeGame());
    document.getElementById('btn-restart-game')?.addEventListener('click', () => {
      if (window.AdManager) {
        window.AdManager.showInterstitial({
          name: 'level_restart',
          afterAd: () => this.startRun(),
          onDone: () => this.startRun()
        });
      } else {
        this.startRun();
      }
    });
    document.getElementById('btn-quit-to-menu')?.addEventListener('click', () => this.returnToMenu());
    document.getElementById('btn-retry')?.addEventListener('click', () => {
      if (window.AdManager) {
        window.AdManager.showInterstitial({
          name: 'level_restart',
          afterAd: () => this.startRun(),
          onDone: () => this.startRun()
        });
      } else {
        this.startRun();
      }
    });
    document.getElementById('btn-go-upgrades')?.addEventListener('click', () => {
      this.returnToMenu();
      document.querySelector('.nav-tab[data-tab="tab-cybernetics"]')?.click();
    });
    document.getElementById('btn-go-menu')?.addEventListener('click', () => this.returnToMenu());
    document.getElementById('btn-vic-endless')?.addEventListener('click', () => {
      this.gameMode = 'endless';
      document.getElementById('victory-modal').classList.add('hidden');
      this.state = 'PLAYING';
      this.wave++;
      this.waveTimer = 0;
    });
    document.getElementById('btn-vic-menu')?.addEventListener('click', () => this.returnToMenu());

    document.getElementById('btn-reroll-perks')?.addEventListener('click', () => this.rerollPerks());

    document.getElementById('btn-autoaim-toggle')?.addEventListener('click', () => {
      this.autoAimEnabled = !this.autoAimEnabled;
      const stateEl = document.getElementById('autoaim-state');
      if (stateEl) stateEl.textContent = this.autoAimEnabled ? 'ON' : 'OFF';
      this.saveData.settings.autoAim = this.autoAimEnabled;
      SaveManager.save(this.saveData);
    });

    const setColorTheme = document.getElementById('set-color-theme');
    if (setColorTheme) setColorTheme.addEventListener('change', (e) => {
      this.saveData.settings.colorTheme = e.target.value;
      SaveManager.save(this.saveData);
      this.applySettingsUI();
    });

    document.getElementById('btn-fullscreen-header')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('btn-fullscreen-hud')?.addEventListener('click', () => this.toggleFullscreen());
    document.getElementById('btn-touch-toggle-hud')?.addEventListener('click', () => this.toggleTouchControls());

    const setTouchMode = document.getElementById('set-touch-mode');
    if (setTouchMode) setTouchMode.addEventListener('change', (e) => {
      this.saveData.settings.touchMode = e.target.value;
      SaveManager.save(this.saveData);
      this.applySettingsUI();
    });

    const setVibrate = document.getElementById('set-vibrate');
    if (setVibrate) setVibrate.addEventListener('change', (e) => {
      this.saveData.settings.vibrate = e.target.checked;
      SaveManager.save(this.saveData);
    });

    // Settings Inputs
    const setSfx = document.getElementById('set-sfx-vol');
    if (setSfx) setSfx.addEventListener('input', (e) => {
      this.saveData.settings.sfxVol = +e.target.value;
      this.audio.sfxVol = +e.target.value / 100;
      document.getElementById('set-sfx-val').textContent = `${e.target.value}%`;
      SaveManager.save(this.saveData);
    });

    const setMusic = document.getElementById('set-music-vol');
    if (setMusic) setMusic.addEventListener('input', (e) => {
      this.saveData.settings.musicVol = +e.target.value;
      this.audio.musicVol = +e.target.value / 100;
      document.getElementById('set-music-val').textContent = `${e.target.value}%`;
      SaveManager.save(this.saveData);
    });

    const setShake = document.getElementById('set-shake');
    if (setShake) setShake.addEventListener('input', (e) => {
      this.saveData.settings.shake = +e.target.value;
      document.getElementById('set-shake-val').textContent = `${e.target.value}%`;
      SaveManager.save(this.saveData);
    });

    const setCrt = document.getElementById('set-crt');
    if (setCrt) setCrt.addEventListener('change', (e) => {
      this.saveData.settings.crt = e.target.checked;
      const overlay = document.getElementById('crt-overlay');
      if (overlay) overlay.style.display = e.target.checked ? 'block' : 'none';
      SaveManager.save(this.saveData);
    });

    const setDmg = document.getElementById('set-dmg-numbers');
    if (setDmg) setDmg.addEventListener('change', (e) => {
      this.saveData.settings.dmgNumbers = e.target.checked;
      SaveManager.save(this.saveData);
    });

    const setAuto = document.getElementById('set-autoaim');
    if (setAuto) setAuto.addEventListener('change', (e) => {
      this.autoAimEnabled = e.target.checked;
      this.saveData.settings.autoAim = e.target.checked;
      const stateEl = document.getElementById('autoaim-state');
      if (stateEl) stateEl.textContent = this.autoAimEnabled ? 'ON' : 'OFF';
      SaveManager.save(this.saveData);
    });

    document.getElementById('btn-save-data')?.addEventListener('click', () => {
      this.saveGameDataManual();
    });

    document.getElementById('btn-reset-progress')?.addEventListener('click', () => {
      this.resetGameProgress();
    });

    document.getElementById('btn-reset-data')?.addEventListener('click', () => {
      this.wipeAllSaveData();
    });

    document.getElementById('btn-close-alert')?.addEventListener('click', () => {
      document.getElementById('cyber-alert-modal')?.classList.add('hidden');
    });

    document.getElementById('cyber-alert-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'cyber-alert-modal') {
        document.getElementById('cyber-alert-modal')?.classList.add('hidden');
      }
    });
  }

  saveGameDataManual() {
    SaveManager.save(this.saveData);
    if (window.AuthManager && this.saveData.googleAccount) {
      try { window.AuthManager.syncCloudSave(); } catch (e) {}
    }

    try {
      if (this.audio) {
        if (typeof this.audio.playVictory === 'function') this.audio.playVictory();
        else if (typeof this.audio.playLevelUp === 'function') this.audio.playLevelUp();
        if (typeof this.audio.playCoin === 'function') this.audio.playCoin();
      }
    } catch (e) {}

    // Visual button feedback
    const saveBtn = document.getElementById('btn-save-data');
    if (saveBtn) {
      const label = saveBtn.querySelector('.btn-main-label');
      const icon = saveBtn.querySelector('.btn-action-icon');
      const origText = label ? label.textContent : 'SAVE GAME DATA';
      const origIcon = icon ? icon.textContent : '💾';
      if (label) label.textContent = 'DATA SAVED!';
      if (icon) icon.textContent = '✅';
      setTimeout(() => {
        if (label) label.textContent = origText;
        if (icon) icon.textContent = origIcon;
      }, 2000);
    }

    this.showNotification('All coins 🪙, diamonds 💎, skins, heroes & progress securely saved!', 'GAME DATA SAVED', 'green');
  }

  resetGameProgress() {
    const msg = "🔄 RESET COMBAT & RUN PROGRESS?\n\nThis will reset:\n• High Scores & Max Wave Records\n• Combat Kills & Survival Times\n• Mission Progress & Achievements\n\nYour Coins 🪙, Diamonds 💎, Unlocked Heroes, and Weapon Skins will be PRESERVED.\n\nProceed?";
    if (confirm(msg)) {
      this.saveData.highScore = 0;
      this.saveData.maxWave = 1;
      this.saveData.enemiesKilled = 0;
      this.saveData.bossesKilled = 0;
      this.saveData.surviveTime = 0;
      this.saveData.maxCombo = 0;
      this.saveData.achievements = [];
      if (this.saveData.missions) {
        this.saveData.missions.dailyProgress = {};
        this.saveData.missions.dailyClaimed = {};
        this.saveData.missions.weeklyProgress = {};
        this.saveData.missions.weeklyClaimed = {};
      }
      SaveManager.save(this.saveData);

      this.renderRecordsUI();
      this.renderAchievementsUI();
      this.renderMissionsUI();

      try {
        if (this.audio && typeof this.audio.playHit === 'function') {
          this.audio.playHit();
        }
      } catch (e) {}

      this.showNotification('Combat records, waves, and mission progress have been reset! Currencies & skins preserved.', 'PROGRESS RESET', 'amber');
    }
  }

  wipeAllSaveData() {
    const msg = "⚠️ WARNING: WIPE ALL SAVE DATA & FACTORY RESET?\n\nThis will completely ERASE EVERYTHING:\n• All Coins 🪙 and Diamonds 💎\n• All Unlocked Heroes & Loadouts\n• All Weapon Skins & Upgrades\n• All High Scores & Missions\n• All Custom Settings\n\nThis action CANNOT be undone! Are you sure you want to reset everything?";
    if (confirm(msg)) {
      SaveManager.reset();
      this.saveData = SaveManager.load();
      this.applySettingsUI();
      this.renderCyberneticsUI();
      this.renderRecordsUI();
      this.renderAchievementsUI();
      this.renderMissionsUI();
      this.updateAllCurrencyDisplays();
      this.renderHeroesGridUI();
      this.renderWeaponsGridUI();
      this.updateHeroPreview();
      this.updateWeaponInspectPreview();
      this.updateAdQuotaUI();

      try {
        if (this.audio && typeof this.audio.playExplosion === 'function') {
          this.audio.playExplosion();
        }
      } catch (e) {}

      this.showNotification('All save data, currencies, heroes, and skins wiped to factory default.', 'FACTORY DATA WIPED', 'red');
    }
  }

  vibrate(pattern = 20) {
    if (this.saveData.settings.vibrate && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  toggleTouchControls() {
    const modes = ['auto', 'always', 'hidden'];
    const currentIdx = modes.indexOf(this.saveData.settings.touchMode || 'auto');
    const nextMode = modes[(currentIdx + 1) % modes.length];
    this.saveData.settings.touchMode = nextMode;
    SaveManager.save(this.saveData);
    this.applySettingsUI();
    this.audio.playDeflect();
  }

  applySettingsUI() {
    const s = this.saveData.settings;
    this.audio.sfxVol = s.sfxVol / 100;
    this.audio.musicVol = s.musicVol / 100;

    // Apply Touch Controls Mode
    document.body.classList.toggle('show-touch-controls', s.touchMode === 'always');
    document.body.classList.toggle('hide-touch-controls', s.touchMode === 'hidden');
    const touchStateStr = s.touchMode === 'always' ? 'ON' : (s.touchMode === 'hidden' ? 'OFF' : 'AUTO');
    const hudTouchText = document.getElementById('touch-state-text-hud');
    if (hudTouchText) hudTouchText.textContent = touchStateStr;
    const setTouchSelect = document.getElementById('set-touch-mode');
    if (setTouchSelect) setTouchSelect.value = s.touchMode || 'auto';
    const setVibCheck = document.getElementById('set-vibrate');
    if (setVibCheck) setVibCheck.checked = (s.vibrate !== false);

    // Apply Theme Palette
    ['theme-cyber', 'theme-matrix', 'theme-crimson', 'theme-gold', 'theme-void'].forEach((cls) => {
      document.body.classList.remove(cls);
    });
    if (s.colorTheme) {
      document.body.classList.add(`theme-${s.colorTheme}`);
    }

    const setThemeSelect = document.getElementById('set-color-theme');
    if (setThemeSelect) setThemeSelect.value = s.colorTheme || 'cyber';

    const sfxInput = document.getElementById('set-sfx-vol');
    if (sfxInput) { sfxInput.value = s.sfxVol; document.getElementById('set-sfx-val').textContent = `${s.sfxVol}%`; }
    const musicInput = document.getElementById('set-music-vol');
    if (musicInput) { musicInput.value = s.musicVol; document.getElementById('set-music-val').textContent = `${s.musicVol}%`; }
    const shakeInput = document.getElementById('set-shake');
    if (shakeInput) { shakeInput.value = s.shake; document.getElementById('set-shake-val').textContent = `${s.shake}%`; }
    const crtInput = document.getElementById('set-crt');
    if (crtInput) { crtInput.checked = s.crt; document.getElementById('crt-overlay').style.display = s.crt ? 'block' : 'none'; }
    const dmgInput = document.getElementById('set-dmg-numbers');
    if (dmgInput) dmgInput.checked = s.dmgNumbers;
    const autoInput = document.getElementById('set-autoaim');
    if (autoInput) autoInput.checked = !!s.autoAim;
    const autoStateEl = document.getElementById('autoaim-state');
    if (autoStateEl) autoStateEl.textContent = s.autoAim ? 'ON' : 'OFF';
    this.autoAimEnabled = !!s.autoAim;
  }

  updateAllCurrencyDisplays() {
    const credits = (this.saveData.credits ?? 0);
    const gems = (this.saveData.gems ?? 0);

    // Topbar Header Wallet
    const topCredits = document.getElementById('topbar-credits');
    const topGems = document.getElementById('topbar-gems');
    if (topCredits) topCredits.textContent = credits.toLocaleString();
    if (topGems) topGems.textContent = gems.toLocaleString();

    // Shop / Cybernetics Lab Vault
    const labCredits = document.getElementById('lab-credits-display');
    const labGems = document.getElementById('lab-gems-display');
    if (labCredits) labCredits.textContent = `🪙 ${credits.toLocaleString()}`;
    if (labGems) labGems.textContent = `💎 ${gems.toLocaleString()}`;
  }

  renderHeroesGridUI() {
    const grid = document.getElementById('heroes-select-grid');
    if (!grid) return;

    if (!Array.isArray(this.saveData.unlockedHeroes)) {
      this.saveData.unlockedHeroes = ['commando'];
    }

    grid.innerHTML = '';

    Object.values(HERO_DEFS).forEach((hero) => {
      const isUnlocked = this.saveData.unlockedHeroes.includes(hero.id);
      const isSelected = this.selectedHero === hero.id;

      const card = document.createElement('div');
      card.className = `hero-card ${isSelected ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;
      card.dataset.hero = hero.id;

      // Stats bars percentages
      const spdPct = Math.min(100, Math.round((hero.speed / 320) * 100));
      const dmgPct = Math.min(100, Math.round((hero.damage / 2.5) * 100));
      const defPct = Math.min(100, Math.round(((hero.hp + hero.shield) / 280) * 100));

      card.innerHTML = `
        <div class="hero-card-top">
          <div class="hero-portrait">${hero.icon}</div>
          <div class="hero-header">
            <h3>${hero.name}</h3>
            <span class="hero-role">${hero.title}</span>
          </div>
        </div>
        <div class="hero-outfit-tag">${hero.outfit}</div>
        <p class="hero-lore">${hero.desc}</p>
        <div class="hero-skills-list">
          <div class="h-skill"><span class="h-skill-tag">PRIMARY</span> <strong>${hero.id === 'ninja' ? 'Neon Katana' : hero.id === 'juggernaut' ? 'Flak Shotgun' : hero.id === 'psionic' ? 'Void Bolts' : hero.id === 'valkyrie' ? 'Dual SMGs' : hero.id === 'phantom' ? 'Gauss Rifle' : hero.id === 'matrix' ? 'Arc Blaster' : 'Plasma Rifle'}</strong></div>
          <div class="h-skill"><span class="h-skill-tag">TACTICAL (Q)</span> <strong>${hero.specialName}</strong></div>
          <div class="h-skill"><span class="h-skill-tag">ULTIMATE (E)</span> <strong>${hero.ultName}</strong></div>
        </div>
        <div class="hero-stat-bars">
          <div class="stat-row"><span>SPEED</span><div class="mini-bar"><div style="width:${spdPct}%; background:${hero.color}"></div></div></div>
          <div class="stat-row"><span>DAMAGE</span><div class="mini-bar"><div style="width:${dmgPct}%; background:${hero.color}"></div></div></div>
          <div class="stat-row"><span>DEFENSE</span><div class="mini-bar"><div style="width:${defPct}%; background:${hero.color}"></div></div></div>
        </div>
        <div class="hero-card-action">
          ${isSelected 
            ? '<button class="btn-hero-select btn-primary">EQUIPPED (DEPLOY)</button>' 
            : isUnlocked 
              ? '<button class="btn-hero-select btn-secondary">SELECT HERO</button>'
              : `<button class="btn-hero-unlock">🔒 UNLOCK 🪙 ${hero.unlockCost.toLocaleString()}</button>`
          }
        </div>
      `;

      card.addEventListener('click', () => {
        if (!isUnlocked) {
          // Attempt coin unlock
          if ((this.saveData.credits || 0) >= hero.unlockCost) {
            this.saveData.credits -= hero.unlockCost;
            this.saveData.unlockedHeroes.push(hero.id);
            this.selectedHero = hero.id;
            this.saveData.selectedHero = hero.id;
            SaveManager.save(this.saveData);
            this.audio.playLevelUp();
            this.showNotification(`Unlocked ${hero.name} with ${hero.outfit}!`, 'HERO UNLOCKED', 'green');
            this.updateHeroPreview();
            this.renderHeroesGridUI();
            this.updateAllCurrencyDisplays();
          } else {
            this.audio.playHit();
            const needed = (hero.unlockCost - (this.saveData.credits || 0)).toLocaleString();
            this.showNotification(`Insufficient Cyber Credits! Complete missions or waves to earn ${needed} more coins.`, 'HERO LOCKED', 'red');
          }
        } else {
          // Select unlocked hero
          this.selectedHero = hero.id;
          this.saveData.selectedHero = hero.id;
          SaveManager.save(this.saveData);
          this.audio.playDeflect();
          this.updateHeroPreview();
          this.renderHeroesGridUI();
        }
      });

      grid.appendChild(card);
    });
  }

  updateLobbyLoadoutSlots() {
    const primId = this.saveData.primaryWeapon || 'ak47';
    const secId = this.saveData.secondaryWeapon || 'ump';
    const primDef = WEAPON_DEFS[primId];
    const secDef = WEAPON_DEFS[secId];

    // Primary Slot (Left)
    const slot1 = document.getElementById('slot-weapon-primary') || document.getElementById('btn-prev-hero');
    if (slot1) {
      if (primDef) {
        const skinId = this.saveData.equippedSkins?.[primId];
        const skinDef = (skinId && WEAPON_SKINS[primId]) ? WEAPON_SKINS[primId][skinId] : null;
        const tierName = skinDef?.tier || primDef.category || 'ASSAULT';
        const tierColor = skinDef?.tierColor || '#00f0ff';
        slot1.classList.add('has-weapon');
        slot1.innerHTML = `
          <div class="slot-type-label">PRIMARY [1]</div>
          <div class="slot-icon-box">
            <span class="slot-weap-icon">${primDef.icon}</span>
          </div>
          <div class="slot-weap-name" title="${primDef.name}">${primDef.name}</div>
          <div class="slot-tier-badge" style="color: ${tierColor}; border-color: ${tierColor};">${tierName}</div>
        `;
        slot1.setAttribute('title', `Primary Weapon: ${primDef.name} (${tierName}) - Click to Change Weapon`);
      } else {
        slot1.classList.remove('has-weapon');
        slot1.innerHTML = `
          <div class="slot-type-label">PRIMARY [1]</div>
          <div class="slot-icon-box">
            <span class="pod-symbol">+</span>
          </div>
          <div class="slot-action-text">EQUIP</div>
        `;
        slot1.setAttribute('title', 'Primary Weapon Slot - Click to Equip');
      }
    }

    // Secondary Slot (Right)
    const slot2 = document.getElementById('slot-weapon-secondary') || document.getElementById('btn-next-hero');
    if (slot2) {
      if (secDef) {
        const skinId = this.saveData.equippedSkins?.[secId];
        const skinDef = (skinId && WEAPON_SKINS[secId]) ? WEAPON_SKINS[secId][skinId] : null;
        const tierName = skinDef?.tier || secDef.category || 'SECONDARY';
        const tierColor = skinDef?.tierColor || '#00ff88';
        slot2.classList.add('has-weapon');
        slot2.innerHTML = `
          <div class="slot-type-label">SECONDARY [2]</div>
          <div class="slot-icon-box">
            <span class="slot-weap-icon">${secDef.icon}</span>
          </div>
          <div class="slot-weap-name" title="${secDef.name}">${secDef.name}</div>
          <div class="slot-tier-badge" style="color: ${tierColor}; border-color: ${tierColor};">${tierName}</div>
        `;
        slot2.setAttribute('title', `Secondary Weapon: ${secDef.name} (${tierName}) - Click to Change Weapon`);
      } else {
        slot2.classList.remove('has-weapon');
        slot2.innerHTML = `
          <div class="slot-type-label">SECONDARY [2]</div>
          <div class="slot-icon-box">
            <span class="pod-symbol">+</span>
          </div>
          <div class="slot-action-text">EQUIP</div>
        `;
        slot2.setAttribute('title', 'Secondary Weapon Slot - Click to Equip');
      }
    }
  }

  updateHeroPreview() {
    this.updateLobbyLoadoutSlots();
    const def = HERO_DEFS[this.selectedHero] || HERO_DEFS['commando'];

    const pName = this.saveData.playerName || 'badhash';

    // Topbar & Stage Sync
    const topName = document.getElementById('topbar-player-name');
    const stageName = document.getElementById('stage-player-name');
    const stageClass = document.getElementById('stage-hero-class');
    const topAvatar = document.getElementById('topbar-hero-avatar');

    if (topName && topName !== document.activeElement) topName.textContent = pName;
    if (stageName) stageName.textContent = pName;
    if (stageClass) stageClass.textContent = def.name.toUpperCase();
    if (topAvatar) {
      if (this.saveData.googleAccount?.picture) {
        topAvatar.innerHTML = `<img src="${this.saveData.googleAccount.picture}" class="topbar-avatar-img" alt="Google Avatar" referrerpolicy="no-referrer">`;
      } else if (this.saveData.googleAccount?.avatar) {
        topAvatar.textContent = this.saveData.googleAccount.avatar;
      } else {
        topAvatar.textContent = def.icon;
      }
    }

    this.updateAllCurrencyDisplays();

    // Quick bar on Mission Select tab
    const avatar = document.getElementById('hq-avatar');
    const name = document.getElementById('hq-hero-name');
    const desc = document.getElementById('hq-hero-desc');
    if (avatar) avatar.textContent = def.icon;
    if (name) name.textContent = def.name.toUpperCase();
    if (desc) desc.textContent = def.desc;

    // Armory Showcase Specials Panel
    const armoryName = document.getElementById('armory-hero-name');
    const armoryRole = document.getElementById('armory-hero-role');
    const armoryOutfit = document.getElementById('armory-hero-outfit');
    const primTitle = document.getElementById('armory-prim-title');
    const primDesc = document.getElementById('armory-prim-desc');
    const specIcon = document.getElementById('armory-spec-icon');
    const specTitle = document.getElementById('armory-spec-title');
    const specDesc = document.getElementById('armory-spec-desc');
    const ultIcon = document.getElementById('armory-ult-icon');
    const ultTitle = document.getElementById('armory-ult-title');
    const ultDesc = document.getElementById('armory-ult-desc');

    if (armoryName) armoryName.textContent = def.name.toUpperCase();
    if (armoryRole) armoryRole.textContent = def.title;
    if (armoryOutfit) armoryOutfit.textContent = def.outfit;

    if (def.id === 'ninja') {
      if (primTitle) primTitle.textContent = 'Neon Katana (Bullet Deflection)';
      if (primDesc) primDesc.textContent = 'Slices through enemies and reflects all incoming hostile bullets back!';
      if (specIcon) specIcon.textContent = '⚡';
      if (specTitle) specTitle.textContent = 'Shadow Teleport Strike [Q]';
      if (specDesc) specDesc.textContent = 'Instant high-speed phantom dash dealing massive crit damage.';
      if (ultIcon) ultIcon.textContent = '🌀';
      if (ultTitle) ultTitle.textContent = 'Blade Vortex Hurricane [E]';
      if (ultDesc) ultDesc.textContent = 'Spins an impenetrable vortex of razor blades shredding all nearby hostiles.';
    } else if (def.id === 'juggernaut') {
      if (primTitle) primTitle.textContent = 'Flak Spread Shotgun';
      if (primDesc) primDesc.textContent = 'Fires heavy 7-pellet buckshot spread with high knockback and penetration.';
      if (specIcon) specIcon.textContent = '🛡️';
      if (specTitle) specTitle.textContent = 'Kinetic Shockwave Stun [Q]';
      if (specDesc) specDesc.textContent = 'Pounds the ground creating a 220px stun ring pushing hostiles back.';
      if (ultIcon) ultIcon.textContent = '🛰️';
      if (ultTitle) ultTitle.textContent = 'Orbital Ion Beam Strike [E]';
      if (ultDesc) ultDesc.textContent = 'Calls in 3 pinpoint orbital laser strikes causing massive explosions.';
    } else if (def.id === 'psionic') {
      if (primTitle) primTitle.textContent = 'Homing Void Bolts';
      if (primDesc) primDesc.textContent = 'Fires curved dark matter projectiles that automatically hunt nearest targets.';
      if (specIcon) specIcon.textContent = '🕳️';
      if (specTitle) specTitle.textContent = 'Singularity Black Hole [Q]';
      if (specDesc) specDesc.textContent = 'Creates a cosmic gravity well pulling in all enemies while dealing damage.';
      if (ultIcon) ultIcon.textContent = '🌟';
      if (ultTitle) ultTitle.textContent = 'Supernova Cataclysm [E]';
      if (ultDesc) ultDesc.textContent = 'Triggers screen-wide antimatter wave erasing enemy projectiles and hostiles.';
    } else if (def.id === 'valkyrie') {
      if (primTitle) primTitle.textContent = 'Dual Crimson Laser SMGs';
      if (primDesc) primDesc.textContent = 'High-velocity dual plasma blasters with rapid suppression spray.';
      if (specIcon) specIcon.textContent = '🔥';
      if (specTitle) specTitle.textContent = 'Napalm Jetpack Dash [Q]';
      if (specDesc) specDesc.textContent = 'Jet-boosts forward dropping burning napalm hazard zones that scorch enemies.';
      if (ultIcon) ultIcon.textContent = '🚀';
      if (ultTitle) ultTitle.textContent = 'Plasma Missile Swarm [E]';
      if (ultDesc) ultDesc.textContent = 'Unleashes 16 homing micro-missiles hunting every hostile on screen.';
    } else if (def.id === 'phantom') {
      if (primTitle) primTitle.textContent = 'Anti-Material Gauss Rifle';
      if (primDesc) primDesc.textContent = 'Hyper-velocity railgun round that pierces straight through 4 enemies.';
      if (specIcon) specIcon.textContent = '🤖';
      if (specTitle) specTitle.textContent = 'EMP Decoy Hologram [Q]';
      if (specDesc) specDesc.textContent = 'Projects a decoy hologram drawing all enemy aggro before EMP detonating.';
      if (ultIcon) ultIcon.textContent = '⚡';
      if (ultTitle) ultTitle.textContent = 'Orbital Death Ray [E]';
      if (ultDesc) ultDesc.textContent = 'Fires a continuous screen-piercing death laser dealing massive damage.';
    } else if (def.id === 'matrix') {
      if (primTitle) primTitle.textContent = 'Chain Arc Blaster';
      if (primDesc) primDesc.textContent = 'Fires electric arc pulses that chain and bounce across groups of hostiles.';
      if (specIcon) specIcon.textContent = '💥';
      if (specTitle) specTitle.textContent = 'Glitch Telefrag [Q]';
      if (specDesc) specDesc.textContent = 'Instantly teleports forward creating a 180px explosive glitch burst.';
      if (ultIcon) ultIcon.textContent = '⏳';
      if (ultTitle) ultTitle.textContent = 'Matrix Time Overclock [E]';
      if (ultDesc) ultDesc.textContent = 'Slows all hostiles by 80% and accelerates your fire rate by 300% for 5s.';
    } else {
      if (primTitle) primTitle.textContent = 'Triple Plasma Rifle';
      if (primDesc) primDesc.textContent = 'Rapid-cycling burst lasers with continuous high-speed suppression.';
      if (specIcon) specIcon.textContent = '💣';
      if (specTitle) specTitle.textContent = 'Cluster Grenade Volley [Q]';
      if (specDesc) specDesc.textContent = 'Launches a volley of frag grenades that detonate in devastating fire.';
      if (ultIcon) ultIcon.textContent = '💥';
      if (ultTitle) ultTitle.textContent = 'Bullet Storm Overdrive [E]';
      if (ultDesc) ultDesc.textContent = 'Discharges a 360-degree radial barrage of 28 high-velocity plasma rounds.';
    }

    // Action button on Heroes tab
    const heroLaunchText = document.getElementById('btn-hero-launch-text');
    if (heroLaunchText) {
      heroLaunchText.textContent = `⚔️ DEPLOY WITH ${def.name.toUpperCase()}`;
    }

    this.renderHeroStageCanvas();
  }

  renderHeroStageCanvas() {
    ['hero-stage-canvas', 'armory-hero-canvas'].forEach((canvasId) => {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const def = HERO_DEFS[this.selectedHero] || HERO_DEFS['commando'];
      const now = performance.now();
      const breathe = Math.sin(now * 0.003) * 3;
      const cx = w / 2;
      const cy = h / 2 + 8;
      const heroColor = def.color;

      ctx.save();

      // 1. Soft Character Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 78, 65, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Body / Legs
      // Left Leg / Combat Boot
      ctx.fillStyle = '#182030';
      ctx.beginPath();
      ctx.roundRect(cx - 32, cy + 18, 24, 55, 5);
      ctx.fill();
      ctx.fillStyle = heroColor;
      ctx.fillRect(cx - 32, cy + 35, 24, 5); // Knee pad

      // Right Leg / Combat Boot
      ctx.fillStyle = '#182030';
      ctx.beginPath();
      ctx.roundRect(cx + 8, cy + 18, 24, 55, 5);
      ctx.fill();
      ctx.fillStyle = heroColor;
      ctx.fillRect(cx + 8, cy + 35, 24, 5); // Knee pad

      // Boots
      ctx.fillStyle = '#0f1422';
      ctx.fillRect(cx - 34, cy + 68, 28, 10);
      ctx.fillRect(cx + 6, cy + 68, 28, 10);

      // 3. Back Wings / Cloaks / Gear (under torso)
      if (def.id === 'valkyrie') {
        // Golden Winged Jetpack Wings
        ctx.fillStyle = '#ffaa00';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(cx - 28, cy - 20);
        ctx.lineTo(cx - 65, cy - 50);
        ctx.lineTo(cx - 38, cy - 5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx + 28, cy - 20);
        ctx.lineTo(cx + 65, cy - 50);
        ctx.lineTo(cx + 38, cy - 5);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (def.id === 'phantom') {
        // Arctic Ghillie Cloak
        ctx.fillStyle = 'rgba(0, 255, 204, 0.18)';
        ctx.beginPath();
        ctx.roundRect(cx - 38, cy - 42, 76, 75, 8);
        ctx.fill();
      }

      // 4. Torso & Tactical Armor (with breathing idle)
      ctx.translate(0, breathe);

      ctx.fillStyle = '#1e2638';
      ctx.beginPath();
      ctx.roundRect(cx - 35, cy - 42, 70, 62, 6);
      ctx.fill();

      // Tactical Kevlar Vest / Chestplate
      ctx.fillStyle = '#141c2c';
      ctx.strokeStyle = heroColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - 28, cy - 38, 56, 50, 5);
      ctx.fill();
      ctx.stroke();

      // Ammo Pouches / Tech Slots
      ctx.fillStyle = '#26344d';
      ctx.fillRect(cx - 22, cy - 4, 12, 12);
      ctx.fillRect(cx - 6, cy - 4, 12, 12);
      ctx.fillRect(cx + 10, cy - 4, 12, 12);

      // Glowing Chest Insignia
      ctx.fillStyle = heroColor;
      ctx.shadowColor = heroColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 5. Arms & Distinct Signature Weapons
      if (def.id === 'ninja') {
        // Glowing Neon Katana Blade across chest
        ctx.strokeStyle = heroColor;
        ctx.shadowColor = heroColor;
        ctx.shadowBlur = 14;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - 65, cy - 65);
        ctx.lineTo(cx + 55, cy + 35);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (def.id === 'juggernaut') {
        // Heavy Flak Shotgun & Blast Shield
        ctx.save();
        ctx.translate(cx + 6, cy - 12);
        ctx.rotate(-0.4);
        ctx.fillStyle = '#0a0e18';
        ctx.fillRect(-18, -10, 75, 18);
        ctx.fillStyle = heroColor;
        ctx.fillRect(57, -8, 32, 14); // Twin Heavy Barrels
        ctx.restore();

        // Left Arm Shoulder Shield
        ctx.fillStyle = heroColor;
        ctx.beginPath();
        ctx.roundRect(cx - 44, cy - 32, 15, 38, 4);
        ctx.fill();
      } else if (def.id === 'psionic') {
        // Floating Void Dark Matter Orbs orbiting hands
        const orbAngle = now * 0.004;
        for (let o = 0; o < 3; o++) {
          const oa = orbAngle + (o * Math.PI * 2) / 3;
          const ox = cx + Math.cos(oa) * 38;
          const oy = cy - 16 + Math.sin(oa) * 18;
          ctx.fillStyle = heroColor;
          ctx.shadowColor = heroColor;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(ox, oy, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (def.id === 'valkyrie') {
        // Dual Crimson SMGs
        ctx.fillStyle = heroColor;
        ctx.shadowColor = heroColor;
        ctx.shadowBlur = 8;
        ctx.fillRect(cx - 40, cy - 10, 16, 7);
        ctx.fillRect(cx + 24, cy - 10, 16, 7);
        ctx.shadowBlur = 0;
      } else if (def.id === 'phantom') {
        // Long Anti-Material Gauss Rifle
        ctx.save();
        ctx.translate(cx + 8, cy - 14);
        ctx.rotate(-0.5);
        ctx.fillStyle = '#0a1018';
        ctx.fillRect(-18, -6, 95, 10);
        ctx.fillStyle = heroColor;
        ctx.fillRect(77, -4, 45, 6);
        ctx.fillRect(15, -14, 14, 6);
        ctx.restore();
      } else if (def.id === 'matrix') {
        // Dual Lightning Coil Blasters
        ctx.fillStyle = heroColor;
        ctx.shadowColor = heroColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(cx - 36, cy - 8, 14, 6);
        ctx.fillRect(cx + 22, cy - 8, 14, 6);
        ctx.shadowBlur = 0;
      } else {
        // Tactical Assault Rifle held diagonally upward
        ctx.save();
        ctx.translate(cx + 8, cy - 16);
        ctx.rotate(-0.45);
        ctx.fillStyle = '#0f1422';
        ctx.fillRect(-16, -8, 68, 13);
        ctx.fillStyle = '#2a3754';
        ctx.fillRect(52, -6, 45, 8);
        ctx.fillStyle = heroColor;
        ctx.fillRect(8, 5, 12, 18);
        ctx.fillStyle = '#ff0055';
        ctx.fillRect(12, -13, 10, 5);
        ctx.restore();
      }

      // 6. Head & Tactical Visor / Helmet
      ctx.fillStyle = '#121826';
      ctx.beginPath();
      ctx.arc(cx, cy - 62, 20, 0, Math.PI * 2);
      ctx.fill();

      // Tactical Visor / Cyber Shades
      ctx.fillStyle = heroColor;
      ctx.shadowColor = heroColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(cx - 15, cy - 66, 30, 10, 3);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Helmet Rim / Cyber Headwear
      ctx.fillStyle = '#1c2538';
      ctx.fillRect(cx - 20, cy - 76, 40, 11);
      ctx.fillRect(cx - 24, cy - 70, 48, 5);

      ctx.restore();
    });
  }

  renderWeaponsGridUI() {
    const grid = document.getElementById('weapons-select-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const primId = this.saveData.primaryWeapon || 'ak47';
    const secId = this.saveData.secondaryWeapon || 'ump';
    const inspectId = this.selectedInspectWeapon || primId;

    Object.values(WEAPON_DEFS).forEach((weap) => {
      const isUnlocked = this.saveData.unlockedWeapons.includes(weap.id);
      const isPrimary = (weap.id === primId);
      const isSecondary = (weap.id === secId);
      const isSelected = (weap.id === inspectId);

      const card = document.createElement('div');
      card.className = `weapon-card ${isSelected ? 'selected' : ''} ${isPrimary ? 'primary-equipped' : ''} ${isSecondary ? 'secondary-equipped' : ''}`;
      
      let equipPrimBtn = '';
      let equipSecBtn = '';

      if (isUnlocked) {
        equipPrimBtn = `<button class="btn-weap-slot ${isPrimary ? 'equipped-prim' : ''}" data-slot="1">${isPrimary ? '✓ PRIMARY [1]' : 'SET PRIM [1]'}</button>`;
        equipSecBtn = `<button class="btn-weap-slot ${isSecondary ? 'equipped-sec' : ''}" data-slot="2">${isSecondary ? '✓ SECONDARY [2]' : 'SET SEC [2]'}</button>`;
      } else {
        const canBuy = (this.saveData.credits || 0) >= weap.unlockCost;
        equipPrimBtn = `<button class="btn-hero-unlock ${canBuy ? '' : 'locked-btn'}" data-unlock="${weap.id}">🔓 UNLOCK (🪙 ${weap.unlockCost})</button>`;
      }

      card.innerHTML = `
        <div class="weapon-card-top">
          <div class="weapon-portrait">${weap.icon}</div>
          <div class="weapon-header">
            <h3>${weap.name}</h3>
            <span class="weapon-category-tag">[${weap.category}]</span>
          </div>
        </div>
        <p class="weapon-lore">${weap.desc}</p>
        <div class="weapon-stats-table">
          <div class="w-stat-line"><span>MAGAZINE:</span><strong>${weap.magSize} ROUNDS</strong></div>
          <div class="w-stat-line"><span>RELOAD TIME:</span><strong>${weap.reloadTime}s</strong></div>
          <div class="w-stat-line"><span>DPS/DAMAGE:</span><strong>${Math.round(weap.damage * 30)}</strong></div>
          <div class="w-stat-line"><span>FIRE RATE:</span><strong>${(1 / weap.fireRate).toFixed(1)}/s</strong></div>
        </div>
        <div class="weapon-card-actions">
          ${equipPrimBtn}
          ${equipSecBtn}
        </div>
      `;

      card.addEventListener('click', (e) => {
        const unlockBtn = e.target.closest('[data-unlock]');
        const slotBtn = e.target.closest('[data-slot]');

        if (unlockBtn) {
          e.stopPropagation();
          if ((this.saveData.credits || 0) >= weap.unlockCost) {
            this.saveData.credits -= weap.unlockCost;
            this.saveData.unlockedWeapons.push(weap.id);
            this.equipWeapon(weap.id, 1);
            this.audio.playLevelUp();
            this.showNotification(`Unlocked weapon: ${weap.name}!`, 'WEAPON ARSENAL UNLOCKED', 'green');
            this.renderWeaponsGridUI();
            this.updateWeaponInspectPreview();
            this.updateAllCurrencyDisplays();
          } else {
            this.audio.playHit();
            const needed = (weap.unlockCost - (this.saveData.credits || 0)).toLocaleString();
            this.showNotification(`Need ${needed} more coins to unlock ${weap.name}!`, 'WEAPON LOCKED', 'red');
          }
          return;
        }

        if (slotBtn) {
          e.stopPropagation();
          const slot = parseInt(slotBtn.dataset.slot, 10);
          this.equipWeapon(weap.id, slot);
          return;
        }

        this.selectedInspectWeapon = weap.id;
        this.audio.playDeflect();
        this.updateWeaponInspectPreview();
        this.renderWeaponsGridUI();
      });

      grid.appendChild(card);
    });
  }

  equipWeapon(weapId, slot) {
    if (!this.saveData.unlockedWeapons.includes(weapId)) {
      this.showNotification('Unlock this weapon first!', 'WEAPON LOCKED', 'red');
      return;
    }

    if (slot === 1) {
      this.saveData.primaryWeapon = weapId;
      if (this.saveData.secondaryWeapon === weapId) {
        const others = this.saveData.unlockedWeapons.filter((w) => w !== weapId);
        this.saveData.secondaryWeapon = others[0] || weapId;
      }
    } else {
      this.saveData.secondaryWeapon = weapId;
      if (this.saveData.primaryWeapon === weapId) {
        const others = this.saveData.unlockedWeapons.filter((w) => w !== weapId);
        this.saveData.primaryWeapon = others[0] || weapId;
      }
    }

    SaveManager.save(this.saveData);
    this.audio.playDeflect();
    this.showNotification(`Equipped ${WEAPON_DEFS[weapId].name} as Slot [${slot}]!`, 'LOADOUT UPDATED', 'green');
    this.renderWeaponsGridUI();
    this.updateWeaponInspectPreview();
    this.updateWeaponHUD();
    this.updateLobbyLoadoutSlots();
  }

  updateWeaponInspectPreview() {
    const weap = WEAPON_DEFS[this.selectedInspectWeapon] || WEAPON_DEFS.ak47;
    const nameEl = document.getElementById('inspect-weap-name');
    const badgeEl = document.getElementById('inspect-weap-badge');
    const catEl = document.getElementById('inspect-weap-category');
    const loreEl = document.getElementById('inspect-weap-lore');

    if (nameEl) nameEl.textContent = weap.name.toUpperCase();
    if (badgeEl) badgeEl.textContent = `${weap.category} CLASS`;
    if (catEl) catEl.textContent = weap.desc.toUpperCase();
    if (loreEl) loreEl.textContent = weap.lore;

    // Spec meters
    const dmgFill = document.getElementById('spec-dmg-fill');
    const dmgVal = document.getElementById('spec-dmg-val');
    if (dmgFill) dmgFill.style.width = `${Math.min(100, Math.round(weap.damage * 40))}%`;
    if (dmgVal) dmgVal.textContent = `${Math.round(weap.damage * 35)} PWR`;

    const frFill = document.getElementById('spec-firerate-fill');
    const frVal = document.getElementById('spec-firerate-val');
    if (frFill) frFill.style.width = `${Math.min(100, Math.round((1 / weap.fireRate) * 10))}%`;
    if (frVal) frVal.textContent = `${(1 / weap.fireRate).toFixed(1)}/s`;

    const rngFill = document.getElementById('spec-range-fill');
    const rngVal = document.getElementById('spec-range-val');
    if (rngFill) rngFill.style.width = `${Math.min(100, Math.round((weap.bulletRange / 1200) * 100))}%`;
    if (rngVal) rngVal.textContent = `${weap.bulletRange} px`;

    const critFill = document.getElementById('spec-crit-fill');
    const critVal = document.getElementById('spec-crit-val');
    if (critFill) critFill.style.width = `${Math.min(100, Math.round((weap.critChance / 0.4) * 100))}%`;
    if (critVal) critVal.textContent = `${weap.critMult}x`;

    this.renderWeaponSkinsUI(weap.id);
    this.renderWeaponInspectCanvas();
  }

  renderWeaponInspectCanvas() {
    const canvas = document.getElementById('weapon-inspect-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const weap = WEAPON_DEFS[this.selectedInspectWeapon] || WEAPON_DEFS.ak47;
    const equippedSkinId = this.saveData.equippedSkins?.[weap.id] || 'default';
    const skinDef = WEAPON_SKINS[weap.id]?.[equippedSkinId] || WEAPON_SKINS[weap.id]?.default;
    const colors = skinDef?.colors || {};
    const color = colors.glow || colors.bulletColor || weap.bulletColor || '#00f0ff';

    ctx.clearRect(0, 0, w, h);

    // High-tech blueprint grid
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Holographic pedestal glow
    const cx = w / 2;
    const cy = h / 2;
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 90);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(cx, cy, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Draw weapon schematic
    ctx.translate(cx, cy);
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;

    if (weap.id === 'ak47') {
      // AK-47 Assault Rifle with Skin Colors
      ctx.fillStyle = colors.wood || '#8b4513';
      ctx.fillRect(-70, -4, 38, 14);
      ctx.fillStyle = colors.body || '#1c222e';
      ctx.fillRect(-32, -8, 48, 16);
      ctx.fillStyle = colors.handguard || '#6b3208';
      ctx.fillRect(16, -6, 32, 12);
      ctx.fillStyle = colors.barrel || '#11151c';
      ctx.fillRect(48, -5, 45, 6);
      ctx.fillStyle = colors.glow || '#ffd700';
      ctx.fillRect(88, -12, 4, 10);
      // Banana Mag
      ctx.save();
      ctx.translate(-10, 8);
      ctx.rotate(-0.25);
      ctx.fillStyle = colors.mag || '#b85d19';
      ctx.fillRect(0, 0, 14, 28);
      ctx.restore();
    } else if (weap.id === 'ump') {
      // UMP-45 SMG with Skin Colors
      ctx.fillStyle = colors.body || '#141a24';
      ctx.fillRect(-60, -6, 85, 15);
      ctx.fillStyle = colors.barrel || '#222d3d';
      ctx.fillRect(25, -4, 35, 8);
      ctx.fillStyle = colors.mag || '#0b0f14';
      ctx.fillRect(0, 9, 10, 32);
      ctx.fillStyle = colors.rail || color;
      ctx.fillRect(-20, -11, 40, 4);
    } else if (weap.id === 'mp40') {
      // MP-40 Submachine Gun with Skin Colors
      ctx.fillStyle = colors.body || '#111722';
      ctx.fillRect(-55, -5, 75, 11);
      ctx.fillStyle = colors.barrel || '#2a3445';
      ctx.fillRect(20, -3, 48, 5);
      ctx.fillStyle = colors.mag || '#0f141d';
      ctx.fillRect(-2, 6, 8, 36);
      ctx.strokeStyle = colors.stock || '#475569';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-75, -2, 22, 12);
    } else if (weap.id === 'double_barrel') {
      // Double Barrel Shotgun with Skin Colors
      ctx.fillStyle = colors.stock || '#6d3b14';
      ctx.fillRect(-65, -3, 45, 16);
      ctx.fillStyle = colors.body || '#161d28';
      ctx.fillRect(-20, -7, 24, 15);
      ctx.fillStyle = colors.barrel || '#3a4759';
      ctx.fillRect(4, -8, 70, 7);
      ctx.fillRect(4, -1, 70, 7);
      ctx.fillStyle = colors.forend || '#6d3b14';
      ctx.fillRect(4, 2, 26, 8);
    } else if (weap.id === 'awm') {
      // AWM Sniper Rifle with Skin Colors
      ctx.fillStyle = colors.body || '#2e4a38';
      ctx.fillRect(-75, -5, 80, 16);
      ctx.fillStyle = colors.barrel || '#0d1219';
      ctx.fillRect(5, -6, 95, 7);
      ctx.fillStyle = colors.brake || '#1f2937';
      ctx.fillRect(100, -9, 12, 13);
      ctx.fillStyle = colors.scope || '#1e293b';
      ctx.fillRect(-25, -18, 48, 9);
      ctx.fillStyle = colors.optic || color;
      ctx.fillRect(-28, -20, 6, 13);
      ctx.fillRect(20, -20, 6, 13);
    } else if (weap.id === 'm4a1') {
      // M4A1 Tactical Carbine with Skin Colors
      ctx.fillStyle = colors.body || '#111827';
      ctx.fillRect(-55, -6, 75, 14);
      ctx.fillStyle = colors.barrel || '#1f2937';
      ctx.fillRect(20, -4, 45, 6);
      ctx.fillRect(65, -7, 8, 12);
      ctx.fillStyle = colors.mag || '#0f172a';
      ctx.fillRect(-10, 8, 12, 22);
      ctx.fillStyle = colors.sight || color;
      ctx.fillRect(-12, -14, 18, 7);
    } else if (weap.id === 'deagle') {
      // Desert Eagle .50 Hand Cannon with Skin Colors
      ctx.fillStyle = colors.body || '#334155';
      ctx.fillRect(-25, -12, 60, 14);
      ctx.fillStyle = colors.grip || '#0f172a';
      ctx.fillRect(-22, 2, 18, 26);
      ctx.fillStyle = colors.bore || '#ffaa00';
      ctx.fillRect(35, -10, 4, 10);
    } else if (weap.id === 'p90') {
      // P90 Bullpup SMG with Skin Colors
      ctx.fillStyle = colors.body || '#1e293b';
      ctx.fillRect(-55, -10, 75, 24);
      ctx.fillStyle = colors.mag || '#0284c7';
      ctx.fillRect(-35, -16, 50, 6);
      ctx.fillStyle = colors.grip || '#0f172a';
      ctx.fillRect(-30, 2, 18, 14);
      ctx.fillStyle = colors.sight || '#38bdf8';
      ctx.fillRect(-8, -22, 14, 7);
    }

    ctx.restore();
  }

  // ==========================================================================
  // WEAPON SKINS UI & CUSTOMIZATION
  // ==========================================================================
  renderWeaponSkinsUI(weaponId) {
    const container = document.getElementById('weapon-skins-list');
    const equippedTag = document.getElementById('current-equipped-skin-name');
    if (!container) return;

    container.innerHTML = '';
    const skins = WEAPON_SKINS[weaponId];
    if (!skins) return;

    const equippedSkinId = this.saveData.equippedSkins?.[weaponId] || 'default';
    const currentSkin = skins[equippedSkinId] || skins.default;
    if (equippedTag) equippedTag.textContent = `Skin: ${currentSkin.name}`;

    Object.values(skins).forEach((skin) => {
      const isOwned = (skin.id === 'default' || (this.saveData.ownedSkins && this.saveData.ownedSkins.includes(skin.id)));
      const isEquipped = (equippedSkinId === skin.id);

      const card = document.createElement('div');
      card.className = `skin-card ${isEquipped ? 'equipped' : ''}`;

      const swatchGrad = skin.colors.body && skin.colors.glow
        ? `linear-gradient(135deg, ${skin.colors.body}, ${skin.colors.glow})`
        : (skin.colors.glow || '#00f0ff');

      let actionBtnHtml = '';
      if (isEquipped) {
        actionBtnHtml = `<button class="skin-btn-action equipped">EQUIPPED</button>`;
      } else if (isOwned) {
        actionBtnHtml = `<button class="skin-btn-action equip">EQUIP</button>`;
      } else {
        const costIcon = skin.costType === 'diamonds' ? '💎' : '🪙';
        actionBtnHtml = `<button class="skin-btn-action buy">${costIcon} ${skin.cost.toLocaleString()}</button>`;
      }

      card.innerHTML = `
        <div class="skin-swatch-wrap" style="background: ${swatchGrad};">
          <span class="skin-tier-badge" style="background: ${skin.tierColor}; color: #000;">${skin.tier}</span>
        </div>
        <div class="skin-name-text" title="${skin.name}">${skin.name}</div>
        ${actionBtnHtml}
      `;

      card.addEventListener('click', () => {
        if (isEquipped) return;
        if (isOwned) {
          this.equipWeaponSkin(weaponId, skin.id);
        } else {
          this.purchaseWeaponSkin(weaponId, skin);
        }
      });

      container.appendChild(card);
    });
  }

  equipWeaponSkin(weaponId, skinId) {
    if (!this.saveData.equippedSkins) this.saveData.equippedSkins = {};
    this.saveData.equippedSkins[weaponId] = skinId;
    SaveManager.save(this.saveData);
    this.audio.playCoin();
    this.renderWeaponSkinsUI(weaponId);
    this.renderWeaponInspectCanvas();
    this.updateLobbyLoadoutSlots();
    const skin = WEAPON_SKINS[weaponId]?.[skinId];
    this.showNotification(`Equipped skin: ${skin?.name || skinId}`, 'SKIN EQUIPPED', 'green');
  }

  purchaseWeaponSkin(weaponId, skin) {
    const isDiamond = (skin.costType === 'diamonds');
    const playerFunds = isDiamond ? (this.saveData.gems || 0) : (this.saveData.credits || 0);

    if (playerFunds >= skin.cost) {
      if (isDiamond) {
        this.saveData.gems -= skin.cost;
      } else {
        this.saveData.credits -= skin.cost;
      }
      if (!this.saveData.ownedSkins) this.saveData.ownedSkins = [];
      this.saveData.ownedSkins.push(skin.id);
      this.equipWeaponSkin(weaponId, skin.id);
      this.audio.playLevelUp();
      this.updateAllCurrencyDisplays();
      this.showNotification(`Purchased & equipped ${skin.name}!`, 'SKIN UNLOCKED', 'green');
    } else {
      this.audio.playHit();
      const needed = (skin.cost - playerFunds).toLocaleString();
      const currencyName = isDiamond ? 'Diamonds' : 'Coins';
      this.showNotification(`Need ${needed} more ${currencyName}! Visit Bank to buy more.`, 'INSUFFICIENT FUNDS', 'red');
      setTimeout(() => {
        if (confirm(`You need ${needed} more ${currencyName} to purchase the ${skin.name} skin.\nWould you like to open the Bank Store to get more?`)) {
          this.switchTab('tab-store');
        }
      }, 300);
    }
  }

  // ==========================================================================
  // AUTOMATED WEEKLY ROTATING SHOP BUNDLE SYSTEM
  // ==========================================================================
  getWeeklyBundleInfo() {
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    // Offset from Unix epoch (Thursday Jan 1 1970) to first Monday (Jan 5 1970 00:00:00 UTC)
    const EPOCH_OFFSET_TO_MONDAY = 4 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const weekNumber = Math.floor((now - EPOCH_OFFSET_TO_MONDAY) / ONE_WEEK_MS);
    const bundleIndex = ((weekNumber % WEEKLY_BUNDLES.length) + WEEKLY_BUNDLES.length) % WEEKLY_BUNDLES.length;
    const activeBundle = WEEKLY_BUNDLES[bundleIndex];
    const nextMondayUTC = (weekNumber + 1) * ONE_WEEK_MS + EPOCH_OFFSET_TO_MONDAY;
    const msUntilReset = Math.max(0, nextMondayUTC - now);
    const weekKey = `week_${weekNumber}_${activeBundle.id}`;

    const isClaimed = !!(this.saveData.weeklyBundlesClaimed && this.saveData.weeklyBundlesClaimed[weekKey]);

    return {
      weekNumber,
      bundleIndex,
      activeBundle,
      nextMondayUTC,
      msUntilReset,
      weekKey,
      isClaimed
    };
  }

  formatBundleCountdown(ms) {
    const d = Math.floor(ms / (24 * 60 * 60 * 1000));
    const h = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const s = Math.floor((ms % (60 * 1000)) / 1000);
    if (d > 0) {
      return `${d}d ${h}h ${m}m`;
    }
    return `${h}h ${m}m ${s}s`;
  }

  renderWeeklyBundleUI() {
    const info = this.getWeeklyBundleInfo();
    const b = info.activeBundle;

    const tagEl = document.getElementById('store-bundle-tag');
    const timerEl = document.getElementById('store-bundle-timer');
    const titleEl = document.getElementById('store-bundle-title');
    const descEl = document.getElementById('store-bundle-desc');
    const perksEl = document.getElementById('store-bundle-perks');
    const origPriceEl = document.getElementById('store-bundle-original-price');
    const buyBtn = document.getElementById('btn-buy-weekly-bundle');
    const priceEl = document.getElementById('store-bundle-price');
    const labelEl = document.getElementById('store-bundle-label');
    const banner = document.getElementById('store-weekly-bundle-banner');

    if (tagEl) tagEl.textContent = b.tag;
    if (timerEl) timerEl.textContent = `⏳ Resets in: ${this.formatBundleCountdown(info.msUntilReset)}`;
    if (titleEl) titleEl.textContent = b.title;
    if (descEl) descEl.innerHTML = b.desc;

    if (banner && b.themeColor) {
      banner.style.borderColor = b.themeColor;
      banner.style.boxShadow = `0 0 25px ${b.themeColor}33`;
    }

    if (perksEl) {
      perksEl.innerHTML = b.perks.map(p => `<span class="bundle-pill ${p.class}">${p.text}</span>`).join('');
    }

    if (origPriceEl) {
      origPriceEl.textContent = `🪙 ${b.originalCost.toLocaleString()}`;
    }

    if (buyBtn) {
      buyBtn.dataset.packId = b.id;
      buyBtn.dataset.name = b.title;
      buyBtn.dataset.costType = b.costType;
      buyBtn.dataset.cost = b.discountedCost;
      buyBtn.dataset.gems = b.gems;
      buyBtn.dataset.coins = b.coins;
      buyBtn.dataset.skin = b.skinId;
      buyBtn.dataset.weaponId = b.weaponId;
      buyBtn.dataset.skinName = b.skinName;
      buyBtn.dataset.weekKey = info.weekKey;

      if (info.isClaimed) {
        buyBtn.disabled = true;
        buyBtn.classList.add('claimed');
        if (priceEl) priceEl.textContent = '✅ CLAIMED';
        if (labelEl) labelEl.textContent = 'OWNED THIS WEEK';
        if (origPriceEl) origPriceEl.style.display = 'none';
      } else {
        buyBtn.disabled = false;
        buyBtn.classList.remove('claimed');
        if (priceEl) priceEl.textContent = `🪙 ${b.discountedCost.toLocaleString()}`;
        if (labelEl) labelEl.textContent = '⚡ INSTANT UNLOCK';
        if (origPriceEl) origPriceEl.style.display = 'block';
      }
    }
  }

  updateWeeklyBundleCountdown() {
    const info = this.getWeeklyBundleInfo();
    const timerEl = document.getElementById('store-bundle-timer');
    if (timerEl) {
      timerEl.textContent = `⏳ Resets in: ${this.formatBundleCountdown(info.msUntilReset)}`;
    }
    if (this.currentRenderedWeek !== info.weekNumber) {
      this.currentRenderedWeek = info.weekNumber;
      this.renderWeeklyBundleUI();
    }
  }

  // ==========================================================================
  // IN-GAME CURRENCY BANK & PACK PURCHASES (100% IN-GAME CURRENCY)
  // ==========================================================================
  openBankPurchaseModal(pack) {
    this.pendingBankPack = pack;
    const modal = document.getElementById('bank-purchase-modal');
    if (!modal) {
      this.confirmBankPurchase(pack);
      return;
    }

    const iconEl = document.getElementById('bp-icon');
    const titleEl = document.getElementById('bp-title');
    const descEl = document.getElementById('bp-desc');
    const costEl = document.getElementById('bp-cost-display');

    if (iconEl) iconEl.textContent = pack.gems > 0 ? '💎' : '🪙';
    if (titleEl) titleEl.textContent = pack.name;

    let descText = '';
    if (pack.gems > 0) descText += `+${pack.gems.toLocaleString()} Diamonds `;
    if (pack.coins > 0) descText += `+${pack.coins.toLocaleString()} Coins `;
    if (pack.skin) {
      const skinLabel = pack.skinName ? pack.skinName : 'Exclusive Weapon Skin';
      descText += `+ ${skinLabel} `;
    }
    if (descEl) descEl.textContent = descText;

    const isCoinCost = (pack.costType === 'coins');
    const costSymbol = isCoinCost ? '🪙' : '💎';
    const costUnit = isCoinCost ? 'Coins' : 'Diamonds';
    if (costEl) costEl.textContent = `${costSymbol} ${pack.cost.toLocaleString()} ${costUnit}`;

    modal.classList.remove('hidden');
  }

  confirmBankPurchase(pack) {
    if (!pack) return;
    const isCoinCost = (pack.costType === 'coins');
    const cost = pack.cost || 0;
    const userFunds = isCoinCost ? (this.saveData.credits || 0) : (this.saveData.gems || 0);
    const currencyName = isCoinCost ? 'Coins' : 'Diamonds';

    if (userFunds < cost) {
      this.audio.playHit();
      const diff = (cost - userFunds).toLocaleString();
      this.showNotification(`Need ${diff} more ${currencyName}! Play matches or complete missions.`, 'INSUFFICIENT FUNDS', 'red');
      document.getElementById('bank-purchase-modal')?.classList.add('hidden');
      return;
    }

    // Deduct in-game currency
    if (isCoinCost) {
      this.saveData.credits -= cost;
    } else {
      this.saveData.gems -= cost;
    }

    // Credit rewards
    if (pack.gems > 0) {
      this.saveData.gems = (this.saveData.gems || 0) + pack.gems;
    }
    if (pack.coins > 0) {
      this.saveData.credits = (this.saveData.credits || 0) + pack.coins;
    }
    if (pack.skin) {
      if (!this.saveData.ownedSkins) this.saveData.ownedSkins = [];
      if (!this.saveData.ownedSkins.includes(pack.skin)) {
        this.saveData.ownedSkins.push(pack.skin);
      }
      if (!this.saveData.equippedSkins) this.saveData.equippedSkins = {};
      const targetWeapon = pack.weaponId || 'ak47';
      this.saveData.equippedSkins[targetWeapon] = pack.skin;
    }

    // Mark weekly bundle claimed if applicable
    if (pack.weekKey) {
      if (!this.saveData.weeklyBundlesClaimed) this.saveData.weeklyBundlesClaimed = {};
      this.saveData.weeklyBundlesClaimed[pack.weekKey] = {
        claimedAt: Date.now(),
        bundleId: pack.id,
        weekKey: pack.weekKey
      };
      this.renderWeeklyBundleUI();
    }

    SaveManager.save(this.saveData);
    this.audio.playLevelUp();
    this.audio.playCoin();
    this.updateAllCurrencyDisplays();

    document.getElementById('bank-purchase-modal')?.classList.add('hidden');

    let rewardText = '';
    if (pack.gems > 0) rewardText += `+${pack.gems.toLocaleString()} 💎 `;
    if (pack.coins > 0) rewardText += `+${pack.coins.toLocaleString()} 🪙 `;
    if (pack.skin) {
      const skinLabel = pack.skinName ? pack.skinName : 'Exclusive Skin';
      rewardText += `+ ${skinLabel}!`;
    }

    this.showNotification(`Unlocked ${pack.name}! (${rewardText})`, 'PURCHASE COMPLETED', 'green');
    this.pendingBankPack = null;
  }

  // ==========================================================================
  // EARN DIAMONDS HUB & REWARDED AD VIDEO SYSTEM
  // ==========================================================================
  openEarnDiamondsHub() {
    this.updateAdQuotaUI();
    document.getElementById('earn-diamonds-modal')?.classList.remove('hidden');
  }

  updateAdQuotaUI() {
    const maxDaily = 10;
    const watched = (this.saveData.missions?.dailyAdsWatched || 0);
    const left = Math.max(0, maxDaily - watched);

    const quotaDisplay = document.getElementById('ad-quota-display');
    if (quotaDisplay) quotaDisplay.textContent = `Available Today: ${left} / ${maxDaily}`;

    const lobbyCount = document.getElementById('lobby-ad-count-text');
    if (lobbyCount) lobbyCount.textContent = `${left} / ${maxDaily} Free Ads Left Today`;
  }

  startRewardedAd() {
    const maxDaily = 10;
    const watched = (this.saveData.missions?.dailyAdsWatched || 0);
    if (watched >= maxDaily) {
      this.showNotification('Daily ad limit reached (10/10). Resets tomorrow at midnight!', 'AD LIMIT REACHED', 'amber');
      return;
    }

    // Close hub modal if open
    document.getElementById('earn-diamonds-modal')?.classList.add('hidden');

    // Attempt Google H5 Games Ads SDK Rewarded adBreak first
    if (window.AdManager && (window.AdManager.isSdkReady || typeof window.adBreak === 'function')) {
      window.AdManager.showRewarded({
        name: 'rewarded_diamonds',
        onReward: () => {
          this.claimAdRewardDirect(25);
        },
        onDismiss: () => {
          // Safely credit reward even if dismissed early per user requirement
          this.claimAdRewardDirect(25);
        },
        fallbackCustomAd: () => {
          this.launchInteractiveCustomAd();
        }
      });
    } else {
      this.launchInteractiveCustomAd();
    }
  }

  claimAdRewardDirect(amount = 25) {
    this.resetAdUIOverlays();
    this.saveData.gems = (this.saveData.gems || 0) + amount;
    if (!this.saveData.missions) this.saveData.missions = {};
    this.saveData.missions.dailyAdsWatched = (this.saveData.missions.dailyAdsWatched || 0) + 1;
    SaveManager.save(this.saveData);

    try {
      if (this.audio) {
        if (typeof this.audio.playVictory === 'function') this.audio.playVictory();
        else if (typeof this.audio.playLevelUp === 'function') this.audio.playLevelUp();
        if (typeof this.audio.playCoin === 'function') this.audio.playCoin();
      }
    } catch (e) {
      console.warn('Audio error:', e);
    }

    this.updateAllCurrencyDisplays();
    this.updateAdQuotaUI();
    this.showNotification(`Claimed +${amount} 💎 Diamonds from rewarded ad! Saved to vault.`, 'REWARD DELIVERED', 'green');
  }

  launchInteractiveCustomAd() {
    const adModal = document.getElementById('rewarded-ad-modal');
    if (!adModal) return;

    // Reset ad UI state
    const secondsEl = document.getElementById('ad-seconds-left');
    const timerBadge = document.getElementById('ad-timer-display');
    const progressBar = document.getElementById('ad-progress-bar');
    const claimBtn = document.getElementById('btn-claim-ad-reward');

    this.adRewardEarned = false;

    if (secondsEl) secondsEl.textContent = '5s';
    if (timerBadge) timerBadge.innerHTML = 'Reward in: <strong id="ad-seconds-left">5s</strong>';
    if (progressBar) progressBar.style.width = '0%';
    if (claimBtn) {
      claimBtn.disabled = true;
      claimBtn.classList.add('disabled');
      claimBtn.innerHTML = '<span>⏳ WATCHING AD (5s)...</span>';
    }

    adModal.classList.remove('hidden');

    // Cycle through exciting ad promos
    const adPromos = [
      {
        logo: '⚔️ CYBER STRIKE 2077',
        genre: 'RTX MULTIPLAYER TACTICAL WARFARE',
        soldier: '🥷💥🤖',
        splat: 'HEADSHOT! +500 PTS',
        features: '🔥 120 FPS Ray-Tracing &bull; ⚔️ Real-Time Co-Op &bull; 🔫 100+ Custom Firearms &bull; ⭐⭐⭐⭐⭐ 4.9 Rating'
      },
      {
        logo: '🤖 MECHA HORIZON: TITANS',
        genre: 'HEAVY ARTILLERY MECH COMBAT',
        soldier: '🦾⚡🔥',
        splat: 'ORBITAL BOMBARDMENT!',
        features: '⚡ 50m Battle Mechs &bull; 💥 Particle Cannons &bull; 🛡️ Titan Shields &bull; ⭐⭐⭐⭐⭐ 4.8 Rating'
      },
      {
        logo: '🌌 NEON SURVIVOR: INFINITY',
        genre: 'CYBERPUNK SCI-FI ROGUELIKE',
        soldier: '🧬✨👾',
        splat: 'OVERCLOCK ACTIVATED!',
        features: '🌐 Cross-Platform Servers &bull; 💎 Free Diamond Drops &bull; 🚀 Zero Latency &bull; ⭐⭐⭐⭐⭐ 5.0 Rating'
      }
    ];
    const promo = adPromos[Math.floor(Math.random() * adPromos.length)];
    const logoEl = adModal.querySelector('.ad-game-logo');
    const genreEl = adModal.querySelector('.ad-game-genre');
    const soldierEl = adModal.querySelector('.ad-mock-soldier');
    const splatEl = adModal.querySelector('.ad-mock-splat');
    const tickerEl = adModal.querySelector('.ad-features-ticker');
    if (logoEl) logoEl.textContent = promo.logo;
    if (genreEl) genreEl.textContent = promo.genre;
    if (soldierEl) soldierEl.textContent = promo.soldier;
    if (splatEl) splatEl.textContent = promo.splat;
    if (tickerEl) tickerEl.innerHTML = promo.features;

    // Run 5-second countdown timer
    if (this.adTimerInterval) clearInterval(this.adTimerInterval);
    const startTime = Date.now();
    const duration = 5000;

    const onAdFinished = () => {
      if (this.adTimerInterval) {
        clearInterval(this.adTimerInterval);
        this.adTimerInterval = null;
      }
      this.adRewardEarned = true;

      // Update UI first
      const curTimerBadge = document.getElementById('ad-timer-display');
      const curProgressBar = document.getElementById('ad-progress-bar');
      const curClaimBtn = document.getElementById('btn-claim-ad-reward');

      if (curTimerBadge) {
        curTimerBadge.innerHTML = '<span style="color: #00ff88; font-weight: 900;">✅ REWARD READY!</span>';
      }
      if (curProgressBar) {
        curProgressBar.style.width = '100%';
      }
      if (curClaimBtn) {
        curClaimBtn.disabled = false;
        curClaimBtn.classList.remove('disabled');
        curClaimBtn.innerHTML = '<span>💎 CLAIM +25 DIAMONDS NOW!</span>';
      }

      // Play audio safely
      try {
        if (this.audio && typeof this.audio.playVictory === 'function') {
          this.audio.playVictory();
        } else if (this.audio && typeof this.audio.playLevelUp === 'function') {
          this.audio.playLevelUp();
        }
      } catch (e) {
        console.warn('Audio error:', e);
      }
    };

    this.adTimerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      const remaining = Math.max(0, Math.ceil((duration - elapsed) / 1000));

      const curProgressBar = document.getElementById('ad-progress-bar');
      const curSec = document.getElementById('ad-seconds-left');
      const curClaimBtn = document.getElementById('btn-claim-ad-reward');

      if (curProgressBar) curProgressBar.style.width = `${progress}%`;
      if (curSec) curSec.textContent = `${remaining}s`;

      if (elapsed >= duration || remaining <= 0) {
        onAdFinished();
      } else if (curClaimBtn) {
        curClaimBtn.innerHTML = `<span>⏳ WATCHING AD (${remaining}s)...</span>`;
      }
    }, 100);
  }

  claimAdReward() {
    if (!this.adRewardEarned) {
      // Fallback: If timer finished or modal says ready, allow claiming
      const timerBadge = document.getElementById('ad-timer-display');
      if (timerBadge && timerBadge.textContent.includes('READY')) {
        this.adRewardEarned = true;
      } else {
        return;
      }
    }
    this.adRewardEarned = false;

    // Add +25 Diamonds
    this.saveData.gems = (this.saveData.gems || 0) + 25;
    if (!this.saveData.missions) this.saveData.missions = {};
    this.saveData.missions.dailyAdsWatched = (this.saveData.missions.dailyAdsWatched || 0) + 1;
    SaveManager.save(this.saveData);

    try {
      if (this.audio) {
        if (typeof this.audio.playLevelUp === 'function') this.audio.playLevelUp();
        if (typeof this.audio.playCoin === 'function') this.audio.playCoin();
      }
    } catch (e) {
      console.warn('Audio error:', e);
    }

    this.updateAllCurrencyDisplays();
    this.updateAdQuotaUI();

    document.getElementById('rewarded-ad-modal')?.classList.add('hidden');
    this.showNotification('Claimed +25 💎 Diamonds from sponsored ad! Saved to vault.', 'AD REWARD DELIVERED', 'green');
  }

  convertDiamondsToCoins(costGems, getCoins) {
    if ((this.saveData.gems || 0) < costGems) {
      this.audio.playHit();
      const needed = costGems - (this.saveData.gems || 0);
      this.showNotification(`Need ${needed} more Diamonds! Purchase in Diamond Vault above.`, 'INSUFFICIENT DIAMONDS', 'red');
      return;
    }

    this.saveData.gems -= costGems;
    this.saveData.credits = (this.saveData.credits || 0) + getCoins;
    SaveManager.save(this.saveData);

    this.audio.playCoin();
    this.updateAllCurrencyDisplays();
    this.showNotification(`Exchanged ${costGems} 💎 for +${getCoins.toLocaleString()} 🪙 Coins!`, 'EXCHANGE COMPLETED', 'green');
  }

  switchTab(tabId) {
    const tabBtn = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
    if (tabBtn) tabBtn.click();
  }

  reloadWeapon() {
    if (!this.player || this.state !== 'PLAYING') return;
    const curWeap = this.player.currentWeapon || WEAPON_DEFS[this.saveData.primaryWeapon] || WEAPON_DEFS.ak47;
    const curAmmo = (this.player.ammo && this.player.ammo[curWeap.id] !== undefined) ? this.player.ammo[curWeap.id] : curWeap.magSize;

    if (this.player.isReloading) return;
    if (curAmmo >= curWeap.magSize) {
      this.particles.addCombatText(this.player.x, this.player.y - 45, 'CLIP FULL!', '#00f0ff');
      return;
    }

    this.player.isReloading = true;
    this.player.reloadTimer = curWeap.reloadTime;
    this.player.reloadDuration = curWeap.reloadTime;
    this.audio.playReloadStart();
    this.particles.addCombatText(this.player.x, this.player.y - 45, 'RELOADING...', '#ffaa00', true);
    this.updateWeaponHUD();
  }

  switchWeapon(slot) {
    if (!this.player) return;
    if (this.player.isReloading) {
      this.player.isReloading = false;
      this.player.reloadTimer = 0;
    }

    this.player.activeWeaponSlot = slot;
    if (slot === 1) {
      this.player.currentWeapon = this.player.primaryWeapon;
    } else {
      this.player.currentWeapon = this.player.secondaryWeapon;
    }

    const curWeap = this.player.currentWeapon;
    if (!this.player.ammo) this.player.ammo = {};
    if (this.player.ammo[curWeap.id] === undefined) {
      this.player.ammo[curWeap.id] = curWeap.magSize;
    }

    this.audio.playDeflect();
    this.updateWeaponHUD();
    this.particles.addCombatText(this.player.x, this.player.y - 45, `${curWeap.name.toUpperCase()} [${this.player.ammo[curWeap.id]}/${curWeap.magSize}]`, curWeap.bulletColor || '#00f0ff', true);
  }

  updateWeaponHUD() {
    const prim = this.player?.primaryWeapon || WEAPON_DEFS[this.saveData.primaryWeapon] || WEAPON_DEFS.ak47;
    const sec = this.player?.secondaryWeapon || WEAPON_DEFS[this.saveData.secondaryWeapon] || WEAPON_DEFS.ump;
    const activeSlot = this.player?.activeWeaponSlot || 1;
    const activeWeap = (activeSlot === 1 ? prim : sec);

    const slot1 = document.getElementById('hud-weap-slot-1');
    const slot2 = document.getElementById('hud-weap-slot-2');
    if (slot1) slot1.classList.toggle('active', activeSlot === 1);
    if (slot2) slot2.classList.toggle('active', activeSlot === 2);

    const name1 = document.getElementById('hud-weap-1-name');
    const icon1 = document.getElementById('hud-weap-1-icon');
    const ammo1 = document.getElementById('hud-weap-1-ammo');
    const name2 = document.getElementById('hud-weap-2-name');
    const icon2 = document.getElementById('hud-weap-2-icon');
    const ammo2 = document.getElementById('hud-weap-2-ammo');

    const primAmmo = (this.player?.ammo && this.player.ammo[prim.id] !== undefined) ? this.player.ammo[prim.id] : prim.magSize;
    const secAmmo = (this.player?.ammo && this.player.ammo[sec.id] !== undefined) ? this.player.ammo[sec.id] : sec.magSize;

    if (name1) name1.textContent = prim.name;
    if (icon1) icon1.textContent = prim.icon;
    if (ammo1) ammo1.textContent = `${primAmmo} / ${prim.magSize}`;
    if (name2) name2.textContent = sec.name;
    if (icon2) icon2.textContent = sec.icon;
    if (ammo2) ammo2.textContent = `${secAmmo} / ${sec.magSize}`;

    // Active Ammo Display & Reload Bar
    const curAmmo = (this.player?.ammo && this.player.ammo[activeWeap.id] !== undefined) ? this.player.ammo[activeWeap.id] : activeWeap.magSize;
    const ammoCurEl = document.getElementById('hud-ammo-current');
    const ammoMaxEl = document.getElementById('hud-ammo-max');
    if (ammoCurEl) {
      ammoCurEl.textContent = curAmmo;
      ammoCurEl.classList.toggle('low-ammo', curAmmo <= Math.max(1, Math.floor(activeWeap.magSize * 0.25)));
    }
    if (ammoMaxEl) ammoMaxEl.textContent = activeWeap.magSize;

    const reloadBar = document.getElementById('hud-reload-bar');
    const reloadFill = document.getElementById('hud-reload-fill');
    if (reloadBar && reloadFill) {
      if (this.player?.isReloading && this.player.reloadDuration > 0) {
        reloadBar.classList.remove('hidden');
        const pct = Math.max(0, Math.min(100, Math.round((1 - this.player.reloadTimer / this.player.reloadDuration) * 100)));
        reloadFill.style.width = `${pct}%`;
      } else {
        reloadBar.classList.add('hidden');
        reloadFill.style.width = '0%';
      }
    }
  }

  renderCyberneticsUI() {
    this.updateAllCurrencyDisplays();
    const grid = document.getElementById('cybernetics-upgrades-grid');
    if (!grid) return;

    grid.innerHTML = '';
    CYBERNETICS_MATRIX.forEach((upg) => {
      const currentTier = this.saveData.cybernetics[upg.id] || 0;
      const cost = Math.floor(upg.baseCost * Math.pow(1.5, currentTier));
      const isMax = currentTier >= upg.maxTier;

      const card = document.createElement('div');
      card.className = 'upgrade-card';

      let pipsHtml = '';
      for (let i = 0; i < upg.maxTier; i++) {
        pipsHtml += `<div class="upg-pip ${i < currentTier ? 'filled' : ''}"></div>`;
      }

      card.innerHTML = `
        <div class="upg-header">
          <div class="upg-icon">${upg.icon}</div>
          <div class="upg-title">${upg.name}</div>
        </div>
        <div class="upg-desc">${upg.desc}</div>
        <div class="upg-level-bar">${pipsHtml}</div>
        <div class="upg-footer">
          <div class="upg-cost">${isMax ? 'MAX TIER' : `🪙 ${cost} CREDITS`}</div>
          <button class="btn-primary btn-upg-buy ${isMax ? 'disabled' : ''}" ${isMax ? 'disabled' : ''}>
            ${isMax ? 'MAX LEVEL' : 'UPGRADE'}
          </button>
        </div>
      `;

      const buyBtn = card.querySelector('.btn-upg-buy');
      if (buyBtn && !isMax) {
        buyBtn.addEventListener('click', () => {
          if (this.saveData.credits >= cost) {
            this.saveData.credits -= cost;
            this.saveData.cybernetics[upg.id] = currentTier + 1;
            SaveManager.save(this.saveData);
            this.audio.playLevelUp();
            this.trackMissionProgress('upgrades', 1);
            this.renderCyberneticsUI();
            this.updateAllCurrencyDisplays();
            this.checkAchievements();
          } else {
            this.audio.playHit();
            this.showNotification('Insufficient Cyber Credits! Complete missions to earn more.', 'INSUFFICIENT CREDITS', 'red');
          }
        });
      }

      grid.appendChild(card);
    });
  }

  showNotification(msg, title = 'INSUFFICIENT CREDITS', type = 'red') {
    const modal = document.getElementById('cyber-alert-modal');
    const box = document.getElementById('cyber-alert-box');
    const iconEl = document.getElementById('alert-modal-icon');
    const titleEl = document.getElementById('alert-modal-title');
    const msgEl = document.getElementById('alert-modal-msg');
    if (!modal) return;

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = msg;

    if (type === 'green' || type === 'success') {
      if (box) {
        box.classList.remove('red-warning');
        box.classList.add('green-success');
      }
      if (iconEl) iconEl.textContent = '✅';
    } else {
      if (box) {
        box.classList.remove('green-success');
        box.classList.add('red-warning');
      }
      if (iconEl) iconEl.textContent = '⚠️';
    }

    modal.classList.remove('hidden');

    if (this.alertTimeout) clearTimeout(this.alertTimeout);
    this.alertTimeout = setTimeout(() => {
      modal.classList.add('hidden');
    }, 2800);
  }

  showGoogleAuthModalState() {
    if (window.AuthManager) {
      window.AuthManager.updateModalUI();
      const nameInput = document.getElementById('input-google-name');
      if (nameInput && !nameInput.value) {
        nameInput.value = this.saveData.playerName !== 'badhash' ? this.saveData.playerName : '';
      }
      return;
    }

    const loggedInWrap = document.getElementById('google-logged-in-state');
    const loggedOutWrap = document.getElementById('google-logged-out-state');
    const nameInput = document.getElementById('input-google-name');
    const g = this.saveData.googleAccount;

    if (g && g.email) {
      if (loggedInWrap) loggedInWrap.classList.remove('hidden');
      if (loggedOutWrap) loggedOutWrap.classList.add('hidden');
      const nameEl = document.getElementById('google-user-display-name');
      const emailEl = document.getElementById('google-user-email');
      const avatarEl = document.getElementById('google-user-avatar-badge');
      const avatarImg = document.getElementById('google-user-avatar-img');
      const syncTimeEl = document.getElementById('google-last-sync-time');

      if (nameEl) nameEl.textContent = g.name || this.saveData.playerName;
      if (emailEl) emailEl.textContent = g.email;
      if (syncTimeEl) syncTimeEl.textContent = `Last sync: ${g.lastSync || 'Just now'}`;

      if (g.picture && avatarImg) {
        avatarImg.src = g.picture;
        avatarImg.classList.remove('hidden');
        if (avatarEl) avatarEl.classList.add('hidden');
      } else {
        if (avatarImg) avatarImg.classList.add('hidden');
        if (avatarEl) {
          avatarEl.textContent = g.avatar || '🎮';
          avatarEl.classList.remove('hidden');
        }
      }
    } else {
      if (loggedInWrap) loggedInWrap.classList.add('hidden');
      if (loggedOutWrap) loggedOutWrap.classList.remove('hidden');
      if (nameInput && !nameInput.value) nameInput.value = this.saveData.playerName !== 'badhash' ? this.saveData.playerName : '';
    }
  }

  renderMissionsUI() {
    const isDaily = (this.saveData.missions?.activeTab !== 'weekly');
    const panelTitle = document.getElementById('missions-panel-title');
    if (panelTitle) panelTitle.textContent = isDaily ? 'Daily Missions:' : 'Weekly Missions:';

    const btnDaily = document.getElementById('btn-tab-daily');
    const btnWeekly = document.getElementById('btn-tab-weekly');
    if (btnDaily) btnDaily.classList.toggle('active', isDaily);
    if (btnWeekly) btnWeekly.classList.toggle('active', !isDaily);

    const listContainer = document.getElementById('missions-list-container');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const defs = isDaily ? DAILY_MISSIONS_DEF : WEEKLY_MISSIONS_DEF;
    const progressMap = isDaily ? (this.saveData.missions.dailyProgress || {}) : (this.saveData.missions.weeklyProgress || {});
    const claimedMap = isDaily ? (this.saveData.missions.dailyClaimed || {}) : (this.saveData.missions.weeklyClaimed || {});

    defs.forEach((m) => {
      const curVal = Math.floor(progressMap[m.id] || 0);
      const isCompleted = curVal >= m.target;
      const isClaimed = !!claimedMap[m.id];
      const pct = Math.min(100, Math.round((curVal / m.target) * 100));

      const card = document.createElement('div');
      card.className = `mission-card ${isCompleted && !isClaimed ? 'ready-to-claim' : ''} ${isClaimed ? 'claimed' : ''}`;

      let rewardText = `+${m.rewardCredits} 🪙`;
      if (m.rewardGems > 0) rewardText += ` +${m.rewardGems} 💎`;

      let actionHtml = '';
      if (isClaimed) {
        actionHtml = `<span class="btn-claimed-badge">✓ COMPLETED</span>`;
      } else if (isCompleted) {
        actionHtml = `<button class="btn-claim-mission" data-mission-id="${m.id}">CLAIM REWARD</button>`;
      } else {
        actionHtml = `<span class="mission-ratio-text">${curVal} / ${m.target}</span>`;
      }

      card.innerHTML = `
        <div class="mission-header-row">
          <span class="mission-title-text">${m.name}</span>
          <span class="mission-reward-label">${rewardText}</span>
        </div>
        <div class="mission-progress-bar">
          <div class="mission-progress-fill" style="width: ${pct}%;"></div>
        </div>
        <div class="mission-footer-row">
          <span class="mission-ratio-text">${pct}% DONE</span>
          ${actionHtml}
        </div>
      `;

      const claimBtn = card.querySelector('.btn-claim-mission');
      if (claimBtn) {
        claimBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.claimMissionReward(m, isDaily);
        });
      }

      listContainer.appendChild(card);
    });
  }

  claimMissionReward(mission, isDaily) {
    if (isDaily) {
      if (!this.saveData.missions.dailyClaimed) this.saveData.missions.dailyClaimed = {};
      if (this.saveData.missions.dailyClaimed[mission.id]) return;
      this.saveData.missions.dailyClaimed[mission.id] = true;
    } else {
      if (!this.saveData.missions.weeklyClaimed) this.saveData.missions.weeklyClaimed = {};
      if (this.saveData.missions.weeklyClaimed[mission.id]) return;
      this.saveData.missions.weeklyClaimed[mission.id] = true;
    }

    this.saveData.credits = (this.saveData.credits || 0) + mission.rewardCredits;
    this.saveData.gems = (this.saveData.gems || 0) + (mission.rewardGems || 0);
    SaveManager.save(this.saveData);

    this.audio.playLevelUp();
    this.updateHeroPreview();
    this.renderMissionsUI();

    let rewardMsg = `Claimed +${mission.rewardCredits} Cyber Credits!`;
    if (mission.rewardGems > 0) rewardMsg += ` and +${mission.rewardGems} Gems!`;
    this.showNotification(rewardMsg, 'MISSION REWARD SECURED', 'green');
  }

  trackMissionProgress(type, amount = 1) {
    if (!this.saveData.missions) return;
    let dirty = false;

    // Daily missions
    DAILY_MISSIONS_DEF.filter((m) => m.type === type).forEach((m) => {
      if (!this.saveData.missions.dailyProgress) this.saveData.missions.dailyProgress = {};
      const current = this.saveData.missions.dailyProgress[m.id] || 0;
      if (type === 'max_wave') {
        this.saveData.missions.dailyProgress[m.id] = Math.max(current, amount);
      } else {
        this.saveData.missions.dailyProgress[m.id] = current + amount;
      }
      dirty = true;
    });

    // Weekly missions
    WEEKLY_MISSIONS_DEF.filter((m) => m.type === type).forEach((m) => {
      if (!this.saveData.missions.weeklyProgress) this.saveData.missions.weeklyProgress = {};
      const current = this.saveData.missions.weeklyProgress[m.id] || 0;
      if (type === 'max_wave') {
        this.saveData.missions.weeklyProgress[m.id] = Math.max(current, amount);
      } else {
        this.saveData.missions.weeklyProgress[m.id] = current + amount;
      }
      dirty = true;
    });

    if (dirty) {
      SaveManager.save(this.saveData);
      this.renderMissionsUI();
    }
  }

  renderRecordsUI() {
    const s = this.saveData;
    const hs = document.getElementById('rec-high-score');
    if (hs) hs.textContent = s.highScore.toLocaleString();
    const mw = document.getElementById('rec-max-wave');
    if (mw) mw.textContent = s.maxWave;
    const tk = document.getElementById('rec-total-kills');
    if (tk) tk.textContent = s.totalKills.toLocaleString();
    const mc = document.getElementById('rec-max-combo');
    if (mc) mc.textContent = `${s.maxCombo}x`;
  }

  renderAchievementsUI() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;
    grid.innerHTML = '';
    ACHIEVEMENTS_LIST.forEach((ach) => {
      const isUnlocked = this.saveData.achievements.includes(ach.id);
      const card = document.createElement('div');
      card.className = `achieve-card ${isUnlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <div class="achieve-icon">${ach.icon}</div>
        <div class="achieve-info">
          <div class="achieve-title">${ach.title} ${isUnlocked ? '✅' : ''}</div>
          <div class="achieve-desc">${ach.desc}</div>
          <div class="mode-reward">REWARD: +${ach.reward} CREDITS</div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  checkAchievements() {
    let newUnlock = false;
    ACHIEVEMENTS_LIST.forEach((ach) => {
      if (!this.saveData.achievements.includes(ach.id)) {
        let condition = false;
        if (ach.id === 'first_blood' && this.saveData.totalKills >= 1) condition = true;
        if (ach.id === 'combo_20' && this.saveData.maxCombo >= 20) condition = true;
        if (ach.id === 'wave_5' && this.saveData.maxWave >= 5) condition = true;
        if (ach.id === 'wave_10' && this.saveData.maxWave >= 10) condition = true;
        if (ach.id === 'kills_500' && this.saveData.totalKills >= 500) condition = true;
        if (ach.id === 'upgrade_max') {
          for (const key in this.saveData.cybernetics) {
            if (this.saveData.cybernetics[key] >= 5) condition = true;
          }
        }

        if (condition) {
          this.saveData.achievements.push(ach.id);
          this.saveData.credits += ach.reward;
          newUnlock = true;
          this.particles.addCombatText(this.player ? this.player.x : WORLD_WIDTH / 2, this.player ? this.player.y - 40 : WORLD_HEIGHT / 2, `🏆 UNLOCKED: ${ach.title}!`, '#ffaa00', true);
        }
      }
    });

    if (newUnlock) {
      SaveManager.save(this.saveData);
      this.renderAchievementsUI();
      this.renderCyberneticsUI();
    }
  }

  // ==========================================================================
  // RUN LIFECYCLE
  // ==========================================================================
  startRun() {
    this.audio.init();
    this.audio.startMusic();

    // Hide menus & modals
    document.getElementById('menu-screen')?.classList.remove('active');
    document.getElementById('pause-modal')?.classList.add('hidden');
    document.getElementById('gameover-modal')?.classList.add('hidden');
    document.getElementById('victory-modal')?.classList.add('hidden');
    document.getElementById('levelup-modal')?.classList.add('hidden');
    document.getElementById('squad-lobby-modal')?.classList.add('hidden');
    document.getElementById('game-hud')?.classList.remove('hud-hidden');

    // Ensure keyboard and mouse focus are on the game window, clearing any leftover input focus
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    window.focus();
    this.keys = {};
    this.mouse.isDown = false;

    // Reset Run Variables
    this.wave = this.gameMode === 'bossrush' ? 5 : 1;
    this.waveTimer = 0;
    this.spawnTimer = 0;
    this.activeBoss = null;
    this.runScore = 0;
    this.runKills = 0;
    this.runCredits = 0;
    this.runTime = 0;
    this.comboCount = 0;
    this.comboTimer = 0;

    // Reset Entities
    this.projectiles = [];
    this.enemyProjectiles = [];
    this.enemies = [];
    this.pickups = [];
    this.hazards = [];
    this.particles.clear();

    // Spawn Player
    const heroDef = HERO_DEFS[this.selectedHero] || HERO_DEFS.commando;
    const cyber = this.saveData.cybernetics;
    const bonusHp = (cyber.hp_boost || 0) * 15;
    const bonusShield = (cyber.shield_boost || 0) * 12;
    const bonusDmg = 1 + (cyber.dmg_boost || 0) * 0.06;
    const bonusSpd = 1 + (cyber.spd_boost || 0) * 0.05;
    const bonusCrit = (cyber.crit_boost || 0) * 0.03;
    const bonusMag = 1 + (cyber.mag_boost || 0) * 0.25;

    this.player = {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2,
      radius: 20,
      hero: heroDef,
      maxHp: heroDef.hp + bonusHp,
      hp: heroDef.hp + bonusHp,
      maxShield: heroDef.shield + bonusShield,
      shield: heroDef.shield + bonusShield,
      shieldRegenRate: 12, // per sec
      shieldCooldown: 0,
      speed: heroDef.speed * bonusSpd,
      damageMult: heroDef.damage * bonusDmg,
      fireRateMult: 1.0,
      fireTimer: 0,
      walkCycle: 0,
      muzzleFlash: 0,
      recoil: 0,
      critChance: heroDef.critChance + bonusCrit,
      critMult: heroDef.critMult,
      magnetRadius: 130 * bonusMag,
      level: 1,
      xp: 0,
      nextLevelXp: 80,
      perks: [],
      dashCooldown: 0,
      dashMaxCd: 1.8,
      isDashing: false,
      dashDuration: 0,
      dashVx: 0,
      dashVy: 0,
      specialCooldown: 0,
      specialMaxCd: heroDef.specialCooldown,
      ultCooldown: 0,
      ultMaxCd: heroDef.ultCooldown,
      cooldownMult: 1.0,
      angle: 0,
      invulnTime: 0
    };

    // Update HUD Icons
    const heroIcon = document.getElementById('hud-hero-icon');
    if (heroIcon) heroIcon.textContent = heroDef.icon;
    const specialIcon = document.getElementById('hud-special-icon');
    if (specialIcon) specialIcon.textContent = heroDef.specialIcon;
    const specialName = document.getElementById('hud-special-name');
    if (specialName) specialName.textContent = heroDef.specialName;
    const ultIcon = document.getElementById('hud-ult-icon');
    if (ultIcon) ultIcon.textContent = heroDef.ultIcon;
    const ultName = document.getElementById('hud-ult-name');
    if (ultName) ultName.textContent = heroDef.ultName;

    // Equip Active Weapon Arsenal Loadout & Ammo
    const primWeapDef = WEAPON_DEFS[this.saveData.primaryWeapon] || WEAPON_DEFS.ak47;
    const secWeapDef = WEAPON_DEFS[this.saveData.secondaryWeapon] || WEAPON_DEFS.ump;
    this.player.primaryWeapon = primWeapDef;
    this.player.secondaryWeapon = secWeapDef;
    this.player.activeWeaponSlot = 1;
    this.player.currentWeapon = primWeapDef;
    this.player.ammo = {
      [primWeapDef.id]: primWeapDef.magSize,
      [secWeapDef.id]: secWeapDef.magSize
    };
    this.player.isReloading = false;
    this.player.reloadTimer = 0;
    this.player.reloadDuration = 0;
    this.player.isDowned = false;
    this.player.downedTimer = 0;
    this.player.reviveProgress = 0;
    this.updateWeaponHUD();

    // Center camera on player immediately
    this.resizeCanvas();
    this.camera.x = this.player.x - this.camera.width / 2;
    this.camera.y = this.player.y - this.camera.height / 2;

    document.getElementById('hud-downed-banner')?.classList.add('hidden');
    document.getElementById('hud-revive-prompt')?.classList.add('hidden');
    document.getElementById('touch-btn-revive')?.classList.add('hidden');

    // Initialize 4-Player Co-Op Squad (AI Companion Bot Completely Disabled)
    if (this.isPrivateMatch) {
      this.teammate = null; // AI companion bot completely turned off
      document.getElementById('hud-squad-panel')?.classList.remove('hidden');
      const roomTag = document.getElementById('hud-squad-room');
      if (roomTag) roomTag.textContent = this.roomCode || 'CYBER-42X';
      this.updateMultiplayerSquadHUD();
    } else {
      this.teammate = null;
      this.squadMembers = [];
      document.getElementById('hud-squad-panel')?.classList.add('hidden');
    }

    this.updatePerksTray();
    this.updateHUD();

    this.state = 'PLAYING';
    document.body.classList.add('playing');
    this.addScreenShake(0.3);

    // Immediate fallback render call to guarantee immediate visible arena and player
    this.renderFallbackFrame();
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    document.body.classList.remove('playing');
    document.getElementById('pause-wave').textContent = this.wave;
    document.getElementById('pause-score').textContent = this.runScore.toLocaleString();
    document.getElementById('pause-kills').textContent = this.runKills;
    document.getElementById('pause-perk-count').textContent = this.player ? this.player.perks.length : 0;
    document.getElementById('pause-modal').classList.remove('hidden');
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.state = 'PLAYING';
    document.body.classList.add('playing');
    document.getElementById('pause-modal').classList.add('hidden');
  }

  returnToMenu() {
    this.state = 'MENU';
    document.body.classList.remove('playing');
    this.audio.stopMusic();
    document.getElementById('game-hud').classList.add('hud-hidden');
    document.getElementById('pause-modal').classList.add('hidden');
    document.getElementById('gameover-modal').classList.add('hidden');
    document.getElementById('victory-modal').classList.add('hidden');
    document.getElementById('levelup-modal').classList.add('hidden');
    document.getElementById('menu-screen').classList.add('active');

    // Clean up 4-Player Co-Op Squad network & panels
    this.cleanupSquadNetwork();
    this.isPrivateMatch = false;
    this.teammate = null;
    this.squadMembers = [];
    document.getElementById('hud-squad-panel')?.classList.add('hidden');
    document.getElementById('hud-downed-banner')?.classList.add('hidden');
    document.getElementById('hud-revive-prompt')?.classList.add('hidden');
    document.getElementById('touch-btn-revive')?.classList.add('hidden');

    this.renderCyberneticsUI();
    this.renderRecordsUI();
    this.renderAchievementsUI();
    this.renderMissionsUI();
    this.updateHeroPreview();
    this.updateAllCurrencyDisplays();
  }

  gameOver() {
    this.state = 'GAMEOVER';
    document.body.classList.remove('playing');
    this.audio.playExplosion();
    this.audio.stopMusic();

    // Save statistics
    const isNewHigh = this.runScore > this.saveData.highScore;
    if (isNewHigh) this.saveData.highScore = this.runScore;
    if (this.wave > this.saveData.maxWave) this.saveData.maxWave = this.wave;
    if (this.comboCount > this.saveData.maxCombo) this.saveData.maxCombo = this.comboCount;
    this.saveData.totalKills += this.runKills;
    this.saveData.credits += this.runCredits;
    SaveManager.save(this.saveData);
    this.checkAchievements();
    this.updateAllCurrencyDisplays();

    // UI stats
    document.getElementById('go-wave').textContent = this.wave;
    document.getElementById('go-score').textContent = this.runScore.toLocaleString();
    document.getElementById('go-kills').textContent = this.runKills;
    document.getElementById('go-credits').textContent = `+${this.runCredits} CREDITS`;
    const newRecBanner = document.getElementById('go-new-record');
    if (newRecBanner) newRecBanner.classList.toggle('hidden', !isNewHigh);
    document.getElementById('gameover-modal').classList.remove('hidden');

    // Trigger Google H5 Games Ads Interstitial on Game Over
    if (window.AdManager) {
      window.AdManager.showInterstitial({
        name: 'game_over_screen',
        onDone: (placementInfo) => {
          console.log('[Game] Game-over interstitial adBreak finished:', placementInfo);
        }
      });
    }
  }

  victory() {
    this.state = 'VICTORY';
    document.body.classList.remove('playing');
    this.audio.playLevelUp();
    this.audio.stopMusic();

    // Bonus credits for victory
    const victoryBonus = 500;
    this.runCredits += victoryBonus;

    const isNewHigh = this.runScore > this.saveData.highScore;
    if (isNewHigh) this.saveData.highScore = this.runScore;
    if (this.wave > this.saveData.maxWave) this.saveData.maxWave = this.wave;
    this.saveData.totalKills += this.runKills;
    this.saveData.credits += this.runCredits;
    SaveManager.save(this.saveData);
    this.trackMissionProgress('wins', 1);
    this.checkAchievements();
    this.updateAllCurrencyDisplays();

    const mins = Math.floor(this.runTime / 60);
    const secs = Math.floor(this.runTime % 60);
    document.getElementById('vic-time').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('vic-score').textContent = this.runScore.toLocaleString();
    document.getElementById('vic-kills').textContent = this.runKills;
    document.getElementById('vic-credits').textContent = `+${this.runCredits} CREDITS`;
    document.getElementById('victory-modal').classList.remove('hidden');
  }

  // ==========================================================================
  // ROGUELITE LEVEL UP & PERKS
  // ==========================================================================
  gainXp(amount) {
    if (!this.player) return;
    this.player.xp += amount;
    if (this.player.xp >= this.player.nextLevelXp) {
      this.player.xp -= this.player.nextLevelXp;
      this.player.level++;
      this.player.nextLevelXp = Math.floor(this.player.nextLevelXp * 1.35 + 40);
      this.openLevelUpModal();
    }
  }

  openLevelUpModal() {
    this.state = 'LEVELUP';
    document.body.classList.remove('playing');
    this.audio.playLevelUp();
    this.rerollsLeft = 1;
    document.getElementById('reroll-count').textContent = this.rerollsLeft;
    this.generatePerkChoices();
    document.getElementById('levelup-modal').classList.remove('hidden');
  }

  generatePerkChoices() {
    const container = document.getElementById('perk-options-container');
    if (!container) return;
    container.innerHTML = '';

    // Pick 3 random distinct perks from database
    const shuffled = [...PERK_DATABASE].sort(() => 0.5 - Math.random());
    this.offeredPerks = shuffled.slice(0, 3);

    this.offeredPerks.forEach((perk) => {
      const card = document.createElement('div');
      card.className = `perk-card rarity-${perk.rarity}`;
      card.innerHTML = `
        <div class="perk-rarity-badge">${perk.rarity}</div>
        <div class="perk-icon-large">${perk.icon}</div>
        <div class="perk-name">${perk.name}</div>
        <div class="perk-desc">${perk.desc}</div>
        <div class="perk-stat-change">${perk.effect}</div>
      `;

      card.addEventListener('click', () => {
        this.selectPerk(perk);
      });

      container.appendChild(card);
    });
  }

  rerollPerks() {
    if (this.rerollsLeft > 0) {
      this.rerollsLeft--;
      document.getElementById('reroll-count').textContent = this.rerollsLeft;
      this.audio.playDeflect();
      this.generatePerkChoices();
    }
  }

  selectPerk(perk) {
    if (!this.player) return;
    this.audio.playLevelUp();
    perk.apply(this.player);
    this.player.perks.push(perk);
    this.updatePerksTray();
    document.getElementById('levelup-modal').classList.add('hidden');
    this.state = 'PLAYING';
    document.body.classList.add('playing');
  }

  updatePerksTray() {
    const tray = document.getElementById('hud-perks-tray');
    if (!tray || !this.player) return;
    tray.innerHTML = '';
    const counts = {};
    this.player.perks.forEach((p) => { counts[p.id] = (counts[p.id] || 0) + 1; });

    const seen = new Set();
    this.player.perks.forEach((p) => {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        const iconDiv = document.createElement('div');
        iconDiv.className = 'perk-mini-icon';
        iconDiv.title = `${p.name}: ${p.desc}`;
        iconDiv.innerHTML = `${p.icon} ${counts[p.id] > 1 ? `<span class="perk-mini-stack">x${counts[p.id]}</span>` : ''}`;
        tray.appendChild(iconDiv);
      }
    });
  }

  // ==========================================================================
  // PLAYER ABILITIES
  // ==========================================================================
  triggerDash() {
    if (!this.player || this.player.isDowned || this.player.dashCooldown > 0 || this.player.isDashing) return;
    this.audio.playDash();
    this.player.dashCooldown = this.player.dashMaxCd * this.player.cooldownMult;
    this.player.isDashing = true;
    this.player.dashDuration = 0.22;
    this.player.invulnTime = 0.25;
    this.trackMissionProgress('dashes', 1);

    // Dash in movement direction or facing angle
    let vx = 0, vy = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) vy -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) vy += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) vx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) vx += 1;
    if (this.touchJoystick.active) {
      vx = this.touchJoystick.dx;
      vy = this.touchJoystick.dy;
    }

    const dist = Math.sqrt(vx * vx + vy * vy);
    let angle = this.player.angle;
    if (dist > 0.1) {
      angle = Math.atan2(vy, vx);
    }

    const dashSpeed = 700 * (this.player.dashDistanceMult || 1);
    this.player.dashVx = Math.cos(angle) * dashSpeed;
    this.player.dashVy = Math.sin(angle) * dashSpeed;

    this.particles.addShockwave(this.player.x, this.player.y, 40, this.player.hero.color, 0.2);

    // Frost Nova Perk on Dash
    if (this.player.frostNova) {
      this.particles.addShockwave(this.player.x, this.player.y, 160, '#00ffff', 0.4);
      this.enemies.forEach((e) => {
        const dx = e.x - this.player.x;
        const dy = e.y - this.player.y;
        if (dx * dx + dy * dy < 160 * 160) {
          e.slowTimer = 3.0;
          e.hp -= 25 * this.player.damageMult;
          this.particles.addCombatText(e.x, e.y, 'FROST!', '#00ffff');
        }
      });
    }
  }

  triggerSpecialSkill() {
    if (!this.player || this.player.isDowned || this.player.specialCooldown > 0) return;
    this.player.specialCooldown = this.player.specialMaxCd * this.player.cooldownMult;
    this.trackMissionProgress('tactical', 1);
    const heroId = this.player.hero.id;

    if (heroId === 'commando') {
      // Cluster Grenade Volley: Fires 4 grenades in arc
      this.audio.playExplosion();
      for (let i = -1.5; i <= 1.5; i += 1.0) {
        const angle = this.player.angle + i * 0.2;
        this.projectiles.push({
          x: this.player.x,
          y: this.player.y,
          vx: Math.cos(angle) * 450,
          vy: Math.sin(angle) * 450,
          radius: 8,
          color: '#00f0ff',
          damage: 60 * this.player.damageMult,
          isGrenade: true,
          fuse: 0.6,
          bounces: 1
        });
      }
    } else if (heroId === 'ninja') {
      // Shadow Blink Strike: Teleport forward and slash path
      this.audio.playDeflect();
      const blinkDist = 240;
      const targetX = Math.max(50, Math.min(WORLD_WIDTH - 50, this.player.x + Math.cos(this.player.angle) * blinkDist));
      const targetY = Math.max(50, Math.min(WORLD_HEIGHT - 50, this.player.y + Math.sin(this.player.angle) * blinkDist));

      // Damage enemies along blink path
      this.enemies.forEach((e) => {
        const dist = Math.hypot(e.x - targetX, e.y - targetY);
        if (dist < 120) {
          e.hp -= 80 * this.player.damageMult;
          this.particles.addSpark(e.x, e.y, '#ff007f', 12);
          this.particles.addCombatText(e.x, e.y, 'SLASH! 80', '#ff007f', true);
        }
      });

      this.particles.addShockwave(this.player.x, this.player.y, 60, '#ff007f');
      this.player.x = targetX;
      this.player.y = targetY;
      this.particles.addShockwave(this.player.x, this.player.y, 80, '#ff007f');
    } else if (heroId === 'juggernaut') {
      // Kinetic Shockwave Stun: Massive AoE slam
      this.audio.playExplosion();
      this.addScreenShake(0.6);
      this.particles.addShockwave(this.player.x, this.player.y, 220, '#ffaa00', 0.5);
      this.enemies.forEach((e) => {
        const dist = Math.hypot(e.x - this.player.x, e.y - this.player.y);
        if (dist < 220) {
          e.hp -= 70 * this.player.damageMult;
          e.stunTimer = 2.5;
          const pushAngle = Math.atan2(e.y - this.player.y, e.x - this.player.x);
          e.vx = Math.cos(pushAngle) * 400;
          e.vy = Math.sin(pushAngle) * 400;
          this.particles.addCombatText(e.x, e.y, 'STUNNED!', '#ffaa00', true);
        }
      });
    } else if (heroId === 'psionic') {
      // Gravity Singularity: Summons black hole at target/forward
      this.audio.playDeflect();
      const holeDist = 200;
      const hx = this.player.x + Math.cos(this.player.angle) * holeDist;
      const hy = this.player.y + Math.sin(this.player.angle) * holeDist;
      this.hazards.push({
        x: hx,
        y: hy,
        radius: 140,
        duration: 4.0,
        damagePerSec: 75 * this.player.damageMult,
        color: '#b336ff',
        type: 'blackhole'
      });
      this.particles.addShockwave(hx, hy, 140, '#b336ff', 0.6);
    } else if (heroId === 'valkyrie') {
      // Napalm Jetpack Dash: Fast boost forward leaving 3 burning napalm pools
      this.audio.playDash();
      this.player.isDashing = true;
      this.player.dashDuration = 0.28;
      this.player.invulnTime = 0.3;
      const boostSpeed = 850;
      this.player.dashVx = Math.cos(this.player.angle) * boostSpeed;
      this.player.dashVy = Math.sin(this.player.angle) * boostSpeed;
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          if (!this.player) return;
          this.hazards.push({
            x: this.player.x,
            y: this.player.y,
            radius: 55,
            duration: 3.0,
            damagePerSec: 65 * this.player.damageMult,
            color: '#ff2a4b',
            type: 'napalm'
          });
          this.particles.addSpark(this.player.x, this.player.y, '#ffaa00', 8);
        }, i * 80);
      }
    } else if (heroId === 'phantom') {
      // EMP Hologram Decoy: Projects decoy that attracts enemies and explodes in EMP shockwave
      this.audio.playDeflect();
      const decoyX = this.player.x + Math.cos(this.player.angle) * 130;
      const decoyY = this.player.y + Math.sin(this.player.angle) * 130;
      this.hazards.push({
        x: decoyX,
        y: decoyY,
        radius: 160,
        duration: 3.2,
        damagePerSec: 40 * this.player.damageMult,
        color: '#00ffcc',
        type: 'decoy'
      });
      this.particles.addShockwave(decoyX, decoyY, 160, '#00ffcc', 0.5);
    } else if (heroId === 'matrix') {
      // Glitch Telefrag: Instantly teleports forward creating 180px explosive glitch burst
      this.audio.playDeflect();
      const teleDist = 260;
      const targetX = Math.max(50, Math.min(WORLD_WIDTH - 50, this.player.x + Math.cos(this.player.angle) * teleDist));
      const targetY = Math.max(50, Math.min(WORLD_HEIGHT - 50, this.player.y + Math.sin(this.player.angle) * teleDist));
      this.particles.addShockwave(this.player.x, this.player.y, 70, '#00ff44');
      this.player.x = targetX;
      this.player.y = targetY;
      this.audio.playExplosion();
      this.addScreenShake(0.4);
      this.particles.addShockwave(targetX, targetY, 180, '#00ff44', 0.5);
      this.enemies.forEach((e) => {
        const dist = Math.hypot(e.x - targetX, e.y - targetY);
        if (dist < 180) {
          e.hp -= 95 * this.player.damageMult;
          this.particles.addCombatText(e.x, e.y, 'GLITCH 95!', '#00ff44', true);
        }
      });
    }
  }

  triggerUltimate() {
    if (!this.player || this.player.isDowned || this.player.ultCooldown > 0) return;
    this.player.ultCooldown = this.player.ultMaxCd * this.player.cooldownMult;
    const heroId = this.player.hero.id;
    this.addScreenShake(0.8);

    if (heroId === 'commando') {
      // Bullet Storm Overdrive: 360 radial plasma barrage
      this.audio.playBossAlarm();
      for (let i = 0; i < 28; i++) {
        const angle = (i / 28) * Math.PI * 2;
        this.projectiles.push({
          x: this.player.x,
          y: this.player.y,
          vx: Math.cos(angle) * 750,
          vy: Math.sin(angle) * 750,
          radius: 7,
          color: '#00f0ff',
          damage: 55 * this.player.damageMult,
          range: 900,
          pierce: 3
        });
      }
    } else if (heroId === 'ninja') {
      // Blade Vortex Hurricane
      this.audio.playDeflect();
      this.hazards.push({
        x: this.player.x,
        y: this.player.y,
        radius: 180,
        duration: 3.5,
        damagePerSec: 140 * this.player.damageMult,
        color: '#ff007f',
        type: 'bladevortex',
        followPlayer: true
      });
    } else if (heroId === 'juggernaut') {
      // Orbital Ion Beam Strike: 3 gigantic orbital laser strikes
      this.audio.playExplosion();
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          if (!this.player) return;
          const ox = this.player.x + (Math.random() - 0.5) * 300;
          const oy = this.player.y + (Math.random() - 0.5) * 300;
          this.hazards.push({
            x: ox,
            y: oy,
            radius: 120,
            duration: 1.5,
            damagePerSec: 250 * this.player.damageMult,
            color: '#ffaa00',
            type: 'orbital'
          });
          this.addScreenShake(0.5);
          this.particles.addShockwave(ox, oy, 150, '#ffaa00', 0.4);
        }, i * 300);
      }
    } else if (heroId === 'psionic') {
      // Supernova Cataclysm: Screen-wide shockwave destroying projectiles and hostiles
      this.audio.playBossAlarm();
      this.particles.addShockwave(this.player.x, this.player.y, 450, '#b336ff', 0.8);
      this.enemyProjectiles = []; // Erase all enemy projectiles
      this.enemies.forEach((e) => {
        const dist = Math.hypot(e.x - this.player.x, e.y - this.player.y);
        if (dist < 500) {
          e.hp -= 180 * this.player.damageMult;
          this.particles.addSpark(e.x, e.y, '#b336ff', 15);
          this.particles.addCombatText(e.x, e.y, 'SUPERNOVA!', '#b336ff', true);
        }
      });
    } else if (heroId === 'valkyrie') {
      // Plasma Missile Swarm: 16 homing micro-rockets
      this.audio.playBossAlarm();
      for (let i = 0; i < 16; i++) {
        setTimeout(() => {
          if (!this.player) return;
          const a = this.player.angle + (Math.random() - 0.5) * 1.5;
          this.projectiles.push({
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(a) * 600,
            vy: Math.sin(a) * 600,
            radius: 6,
            color: '#ff2a4b',
            damage: 60 * this.player.damageMult,
            range: 1000,
            isHoming: true
          });
          this.audio.playShoot('valkyrie');
        }, i * 70);
      }
    } else if (heroId === 'phantom') {
      // Orbital Death Ray: Screen-clearing beam
      this.audio.playBossAlarm();
      this.addScreenShake(1.0);
      const angle = this.player.angle;
      for (let step = 50; step < 1200; step += 40) {
        const bx = this.player.x + Math.cos(angle) * step;
        const by = this.player.y + Math.sin(angle) * step;
        this.particles.addShockwave(bx, by, 60, '#00ffcc', 0.3);
      }
      this.enemies.forEach((e) => {
        const enemyAngle = Math.atan2(e.y - this.player.y, e.x - this.player.x);
        let diff = Math.abs(angle - enemyAngle);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff < 0.25) {
          e.hp -= 220 * this.player.damageMult;
          this.particles.addCombatText(e.x, e.y, 'DEATH RAY!', '#00ffcc', true);
        }
      });
    } else if (heroId === 'matrix') {
      // Matrix Time Overclock: Slows all enemies by 80% and 300% player fire rate
      this.audio.playLevelUp();
      this.addScreenShake(0.5);
      this.particles.addShockwave(this.player.x, this.player.y, 400, '#00ff44', 0.8);
      this.enemies.forEach((e) => {
        e.slowTimer = 5.0;
        this.particles.addCombatText(e.x, e.y, 'TIME FROZEN!', '#00ff44');
      });
      this.player.fireRateMult *= 0.35;
      setTimeout(() => {
        if (this.player) this.player.fireRateMult /= 0.35;
      }, 5000);
    }
  }

  // ==========================================================================
  // COMBAT & FIRING
  // ==========================================================================
  firePrimaryWeapon() {
    if (!this.player || this.player.isDowned || this.player.fireTimer > 0) return;
    const weap = this.player.currentWeapon || WEAPON_DEFS[this.saveData.primaryWeapon] || WEAPON_DEFS.ak47;

    // Reload check
    if (this.player.isReloading) return;

    if (!this.player.ammo) this.player.ammo = {};
    if (this.player.ammo[weap.id] === undefined) {
      this.player.ammo[weap.id] = weap.magSize;
    }

    if (this.player.ammo[weap.id] <= 0) {
      this.audio.playDryFire();
      this.particles.addCombatText(this.player.x, this.player.y - 45, 'EMPTY! [PRESS R]', '#ff3344', true);
      this.reloadWeapon();
      this.player.fireTimer = 0.25;
      return;
    }

    // Deduct 1 round & update HUD
    this.player.ammo[weap.id]--;
    this.updateWeaponHUD();

    this.player.fireTimer = weap.fireRate * (this.player.fireRateMult || 1.0);

    const isCrit = Math.random() < (this.player.critChance || weap.critChance || 0.15);
    const dmg = (weap.damage * (isCrit ? (this.player.critMult || weap.critMult || 2.2) : 1.0) * 32) * this.player.damageMult;
    const angle = this.player.angle;
    const extra = this.player.extraProjectiles || 0;

    const eqSkinId = this.saveData.equippedSkins?.[weap.id] || 'default';
    const activeBulletColor = WEAPON_SKINS[weap.id]?.[eqSkinId]?.colors?.bulletColor || weap.bulletColor;

    // Trigger Gun recoil & Muzzle flash
    this.player.muzzleFlash = 0.08;
    this.player.recoil = (weap.category === 'SHOTGUN' || weap.category === 'SNIPER' || weap.id === 'deagle' ? 6.5 : 3.5);

    if (weap.id === 'double_barrel') {
      // Double Barrel Shotgun: 10-12 spread pellets + twin shell casings
      this.audio.playShoot('shotgun');
      this.particles.addShellCasing(this.player.x, this.player.y, angle + Math.PI * 0.6);
      this.particles.addShellCasing(this.player.x, this.player.y, angle + Math.PI * 0.55);
      this.addScreenShake(0.18);
      const pelletCount = (weap.pellets || 10) + extra * 2;
      for (let i = 0; i < pelletCount; i++) {
        const spread = (Math.random() - 0.5) * 0.48;
        const pelletAngle = angle + spread;
        const spd = weap.bulletSpeed * (0.85 + Math.random() * 0.3);
        this.projectiles.push({
          x: this.player.x,
          y: this.player.y,
          vx: Math.cos(pelletAngle) * spd,
          vy: Math.sin(pelletAngle) * spd,
          radius: weap.bulletSize,
          color: activeBulletColor,
          damage: (dmg / 4.8),
          range: weap.bulletRange * (0.7 + Math.random() * 0.4),
          isCrit,
          bounces: this.player.bounces || 0
        });
      }
    } else if (weap.id === 'awm') {
      // AWM Bolt-Action Magnum Sniper Rifle: 4-pierce laser-fast round
      this.audio.playShoot('sniper');
      this.particles.addShellCasing(this.player.x, this.player.y, angle + Math.PI * 0.55);
      this.addScreenShake(0.35);
      this.projectiles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(angle) * weap.bulletSpeed,
        vy: Math.sin(angle) * weap.bulletSpeed,
        radius: weap.bulletSize,
        color: activeBulletColor,
        damage: dmg * 1.6,
        range: weap.bulletRange,
        pierce: 4,
        isCrit,
        bounces: this.player.bounces || 0
      });
    } else if (weap.id === 'deagle') {
      // Desert Eagle .50 Hand Cannon
      this.audio.playShoot('deagle');
      this.particles.addShellCasing(this.player.x, this.player.y, angle + Math.PI * 0.5);
      this.addScreenShake(0.15);
      this.projectiles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(angle) * weap.bulletSpeed,
        vy: Math.sin(angle) * weap.bulletSpeed,
        radius: weap.bulletSize,
        color: activeBulletColor,
        damage: dmg,
        range: weap.bulletRange,
        pierce: 1,
        isCrit,
        bounces: this.player.bounces || 0
      });
    } else if (weap.id === 'ump' || weap.id === 'mp40' || weap.id === 'p90') {
      // Submachine Guns (UMP-45, MP-40, P90)
      this.audio.playShoot('smg');
      this.particles.addShellCasing(this.player.x, this.player.y, angle + Math.PI * 0.5);
      const count = 1 + extra;
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 0.09 + (i - (count - 1) / 2) * 0.08;
        this.projectiles.push({
          x: this.player.x,
          y: this.player.y,
          vx: Math.cos(angle + spread) * weap.bulletSpeed,
          vy: Math.sin(angle + spread) * weap.bulletSpeed,
          radius: weap.bulletSize,
          color: activeBulletColor,
          damage: dmg,
          range: weap.bulletRange,
          pierce: weap.pierce || 0,
          isCrit,
          bounces: this.player.bounces || 0
        });
      }
    } else {
      // Assault Rifles (AK-47, M4A1)
      this.audio.playShoot(weap.id === 'm4a1' ? 'm4a1' : 'ak47');
      this.particles.addShellCasing(this.player.x, this.player.y, angle + Math.PI * 0.55);
      const count = 1 + extra;
      for (let i = 0; i < count; i++) {
        const spread = (Math.random() - 0.5) * 0.06 + (i - (count - 1) / 2) * 0.08;
        this.projectiles.push({
          x: this.player.x,
          y: this.player.y,
          vx: Math.cos(angle + spread) * weap.bulletSpeed,
          vy: Math.sin(angle + spread) * weap.bulletSpeed,
          radius: weap.bulletSize,
          color: activeBulletColor,
          damage: dmg,
          range: weap.bulletRange,
          pierce: weap.pierce || 0,
          isCrit,
          bounces: this.player.bounces || 0
        });
      }
    }

    // Broadcast Gunshot to Co-Op Teammate (Private Match)
    if (this.isPrivateMatch && this.netChannel) {
      this.netChannel.postMessage({
        type: 'FIRE',
        senderId: this.networkId,
        x: this.player.x,
        y: this.player.y,
        angle: this.player.angle,
        weaponId: weap.id
      });
    }
  }

  damageEnemy(enemy, amount, isCrit = false) {
    enemy.hp -= amount;
    this.audio.playHit(isCrit);
    this.particles.addBlood(enemy.x, enemy.y, enemy.isBoss ? '#ffaa00' : '#ff0055', isCrit ? 8 : 4);

    if (this.saveData.settings.dmgNumbers) {
      const text = isCrit ? `CRIT! ${Math.round(amount)}` : `${Math.round(amount)}`;
      this.particles.addCombatText(enemy.x, enemy.y, text, isCrit ? '#ffaa00' : '#ffffff', isCrit);
    }

    // Executioner Perk (<25% HP instant detonation)
    if (this.player.executioner && !enemy.isBoss && enemy.hp > 0 && enemy.hp / enemy.maxHp < 0.25) {
      enemy.hp = 0;
      this.particles.addCombatText(enemy.x, enemy.y, 'EXECUTED!', '#ff0033', true);
      this.particles.addShockwave(enemy.x, enemy.y, 60, '#ff0033');
    }

    // Chain Lightning Perk
    if (this.player.chainLightning && Math.random() < 0.4) {
      let targets = this.enemies.filter((e) => e !== enemy).slice(0, 4);
      targets.forEach((tgt) => {
        tgt.hp -= 20 * this.player.damageMult;
        this.particles.addSpark(tgt.x, tgt.y, '#00ffff', 6);
        this.particles.addCombatText(tgt.x, tgt.y, '⚡', '#00ffff');
      });
    }

    if (enemy.hp <= 0 && !enemy.dead) {
      enemy.dead = true;
      this.onEnemyKilled(enemy);
    }
  }

  onEnemyKilled(enemy) {
    this.runKills++;
    this.trackMissionProgress('kills', 1);
    if (enemy.isBoss) this.trackMissionProgress('bosses', 1);
    this.comboCount++;
    this.comboTimer = this.comboMaxTime;
    const comboMult = 1 + Math.min(this.comboCount * 0.05, 2.5);
    const scoreAdd = Math.round((enemy.scoreValue || 50) * comboMult);
    this.runScore += scoreAdd;

    // Ground scorch marks, smoke & debris on hostile explosion
    const scorchRadius = enemy.isBoss ? 55 : (enemy.type === 'goliath' ? 36 : 22);
    this.particles.addScorchMark(enemy.x, enemy.y, scorchRadius);
    this.particles.addSmoke(enemy.x, enemy.y, 'rgba(100, 130, 160, 0.35)', enemy.isBoss ? 8 : 4, 70);
    this.particles.addSpark(enemy.x, enemy.y, enemy.color, enemy.isBoss ? 28 : 12, 220);

    // Drop XP Gem
    this.pickups.push({
      x: enemy.x,
      y: enemy.y,
      type: 'xp',
      val: enemy.isBoss ? 150 : 20,
      radius: 8,
      color: enemy.isBoss ? '#ffaa00' : '#00f0ff'
    });

    // Chance to drop Credits
    if (Math.random() < (enemy.isBoss ? 1.0 : 0.35)) {
      this.pickups.push({
        x: enemy.x + (Math.random() - 0.5) * 20,
        y: enemy.y + (Math.random() - 0.5) * 20,
        type: 'credit',
        val: enemy.isBoss ? 50 : 5,
        radius: 8,
        color: '#ffaa00'
      });
    }

    // Chance to drop Medkit / Stim
    if (Math.random() < 0.04) {
      this.pickups.push({
        x: enemy.x,
        y: enemy.y,
        type: 'heal',
        val: 30,
        radius: 10,
        color: '#00ff88'
      });
    }

    // Vampiric Siphon Perk
    if (this.player.lifesteal && Math.random() < 0.2) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 4);
      this.player.shield = Math.min(this.player.maxShield, this.player.shield + 6);
      this.particles.addCombatText(this.player.x, this.player.y, '+HEAL', '#00ff88');
    }

    // Singularity on 20 Kills Perk
    if (this.player.singularityPerk && this.runKills % 20 === 0) {
      this.hazards.push({
        x: enemy.x,
        y: enemy.y,
        radius: 120,
        duration: 3.0,
        damagePerSec: 60 * this.player.damageMult,
        color: '#b336ff',
        type: 'blackhole'
      });
    }

    if (enemy.isBoss) {
      this.addScreenShake(1.0);
      this.particles.addShockwave(enemy.x, enemy.y, 250, '#ffaa00', 0.8);
      this.activeBoss = null;
      document.getElementById('boss-hud-bar').classList.add('hidden');

      if (this.gameMode === 'campaign' && this.wave >= 10) {
        this.victory();
      }
    }
  }

  // ==========================================================================
  // ENEMY SPAWNER & WAVE DIRECTOR
  // ==========================================================================
  updateWaveDirector(dt) {
    this.waveTimer += dt;
    this.runTime += dt;

    // Check wave advancement
    if (this.waveTimer >= this.waveDuration && !this.activeBoss) {
      this.wave++;
      this.waveTimer = 0;
      this.particles.addCombatText(this.player.x, this.player.y - 60, `WAVE ${this.wave}!`, '#00f0ff', true);
      this.audio.playBossAlarm();

      // Boss Wave Triggers (Wave 5 & Wave 7 & Wave 10 or every 5 waves in endless)
      if (this.wave === 5 || this.wave === 7 || this.wave === 10 || (this.gameMode === 'endless' && this.wave % 5 === 0)) {
        this.spawnBoss();
      }
    }

    // Atmospheric Cyber Dust Particles
    if (Math.random() < 0.25) {
      this.particles.addDustMote(WORLD_WIDTH, WORLD_HEIGHT);
    }

    // Spawning hostiles with progressively increasing spawn frequency
    this.spawnTimer += dt;
    // Wave 1: 1.6s interval, Wave 2: 1.35s, Wave 3: 1.1s, Wave 4: 0.9s, Wave 5: 0.75s, Wave 6: 0.6s, Wave 7+: 0.42s
    const spawnRate = Math.max(0.35, 1.65 - (this.wave - 1) * 0.18);
    if (this.spawnTimer >= spawnRate) {
      this.spawnTimer = 0;
      this.spawnEnemyGroup();
    }
  }

  spawnEnemyGroup() {
    if (!this.player || this.enemies.length >= 85) return;

    // Number of enemies to spawn per burst (higher waves spawn tactical squads)
    let spawnCount = 1;
    if (this.wave === 4 && Math.random() < 0.25) spawnCount = 2;
    else if (this.wave === 5 && Math.random() < 0.35) spawnCount = 2;
    else if (this.wave === 6 && Math.random() < 0.50) spawnCount = 2;
    else if (this.wave >= 7) spawnCount = Math.random() < 0.6 ? 2 : (Math.random() < 0.25 ? 3 : 1);

    for (let c = 0; c < spawnCount; c++) {
      let chosenType = 'scrapper';
      const rand = Math.random();

      if (this.wave === 1) {
        // WAVE 1: ONLY RED VIRUS
        chosenType = 'scrapper';
      } else if (this.wave === 2) {
        // WAVE 2: ONLY PINK VIRUS
        chosenType = 'stalker';
      } else if (this.wave === 3) {
        // WAVE 3: RED AND YELLOW VIRUS
        chosenType = (rand < 0.5) ? 'scrapper' : 'goliath';
      } else if (this.wave === 4) {
        // WAVE 4: Escalation (Red 35%, Pink 35%, Yellow 20%, Kamikaze 10%)
        if (rand < 0.35) chosenType = 'scrapper';
        else if (rand < 0.70) chosenType = 'stalker';
        else if (rand < 0.90) chosenType = 'goliath';
        else chosenType = 'kamikaze';
      } else if (this.wave === 5) {
        // WAVE 5: Boss Wave + Heavy Mixed Assault
        if (rand < 0.30) chosenType = 'scrapper';
        else if (rand < 0.55) chosenType = 'stalker';
        else if (rand < 0.80) chosenType = 'goliath';
        else chosenType = 'sniper';
      } else if (this.wave === 6) {
        // WAVE 6: Pandemic Swarm (Pink, Yellow, Shielders, Kamikaze, Snipers)
        if (rand < 0.25) chosenType = 'stalker';
        else if (rand < 0.50) chosenType = 'goliath';
        else if (rand < 0.70) chosenType = 'shield';
        else if (rand < 0.85) chosenType = 'kamikaze';
        else chosenType = 'sniper';
      } else {
        // WAVE 7+: Apex Overdrive Gauntlet
        if (rand < 0.25) chosenType = 'stalker';
        else if (rand < 0.45) chosenType = 'goliath';
        else if (rand < 0.65) chosenType = 'shield';
        else if (rand < 0.80) chosenType = 'kamikaze';
        else if (rand < 0.92) chosenType = 'sniper';
        else chosenType = 'scrapper';
      }

      const spawnDist = 650 + Math.random() * 120;
      const angle = Math.random() * Math.PI * 2;
      const spawnX = Math.max(50, Math.min(WORLD_WIDTH - 50, this.player.x + Math.cos(angle) * spawnDist));
      const spawnY = Math.max(50, Math.min(WORLD_HEIGHT - 50, this.player.y + Math.sin(angle) * spawnDist));

      this.createEnemy(chosenType, spawnX, spawnY);
    }
  }

  createEnemy(type, x, y) {
    // Progressive Difficulty Scaling across waves:
    // Scaling HP, Speed, and Attack Damage
    const hpScale = 1 + (this.wave - 1) * 0.32 + (this.wave >= 4 ? (this.wave - 3) * 0.22 : 0);
    const speedScale = 1 + Math.min(0.55, (this.wave - 1) * 0.08);
    const dmgScale = 1 + (this.wave - 1) * 0.18;

    let def = {
      x, y,
      type,
      radius: 16,
      color: '#ff2a4b', // Red Virus
      maxHp: 40 * hpScale,
      hp: 40 * hpScale,
      speed: 160 * speedScale,
      damage: Math.round(15 * dmgScale),
      scoreValue: 50,
      shootTimer: 0.8 + Math.random() * 1.5,
      dead: false
    };

    if (type === 'stalker') {
      def.radius = 14;
      def.color = '#ff007f'; // Pink Virus
      def.maxHp = 60 * hpScale;
      def.hp = 60 * hpScale;
      def.speed = 225 * speedScale;
      def.damage = Math.round(22 * dmgScale);
      def.scoreValue = 80;
    } else if (type === 'goliath') {
      def.radius = 28;
      def.color = '#ffcc00'; // Yellow Virus
      def.maxHp = 220 * hpScale;
      def.hp = 220 * hpScale;
      def.speed = 95 * speedScale;
      def.damage = Math.round(40 * dmgScale);
      def.scoreValue = 180;
    } else if (type === 'sniper') {
      def.radius = 18;
      def.color = '#00f0ff';
      def.maxHp = 55 * hpScale;
      def.hp = 55 * hpScale;
      def.speed = 105 * speedScale;
      def.damage = Math.round(35 * dmgScale);
      def.scoreValue = 100;
      def.shootTimer = Math.max(1.4, 2.5 - this.wave * 0.15);
    } else if (type === 'kamikaze') {
      def.radius = 14;
      def.color = '#ff5500';
      def.maxHp = 35 * hpScale;
      def.hp = 35 * hpScale;
      def.speed = 280 * speedScale;
      def.damage = Math.round(65 * dmgScale);
      def.scoreValue = 90;
      def.fuse = 3.5;
    } else if (type === 'shield') {
      def.radius = 20;
      def.color = '#00ff88';
      def.maxHp = 150 * hpScale;
      def.hp = 150 * hpScale;
      def.speed = 135 * speedScale;
      def.damage = Math.round(12 * dmgScale);
      def.scoreValue = 140;
      def.shieldRadius = 150;
    }

    this.enemies.push(def);
  }

  spawnBoss() {
    this.audio.playBossAlarm();
    this.addScreenShake(0.8);
    const isApex = this.wave >= 7 && this.wave < 10;
    const isCore = this.wave >= 10;

    let bossName = 'TITAN DREADNOUGHT';
    let bossColor = '#ff0033';
    let baseHp = 1800;

    if (isCore) {
      bossName = 'OVERLORD CYBER-CORE';
      bossColor = '#b336ff';
      baseHp = 4200;
    } else if (isApex) {
      bossName = 'APEX CYBER-LEVIATHAN';
      bossColor = '#ffaa00';
      baseHp = 2900;
    }

    const boss = {
      x: this.player.x + 400,
      y: this.player.y - 300,
      radius: isApex ? 50 : 45,
      isBoss: true,
      name: bossName,
      color: bossColor,
      maxHp: baseHp * (1 + (this.wave - 5) * 0.35),
      hp: baseHp * (1 + (this.wave - 5) * 0.35),
      speed: isCore ? 85 : (isApex ? 120 : 110),
      damage: isApex ? 55 : 45,
      scoreValue: isApex ? 3500 : 2500,
      attackPhase: 0,
      phaseTimer: 0,
      dead: false
    };

    this.activeBoss = boss;
    this.enemies.push(boss);

    const bossBar = document.getElementById('boss-hud-bar');
    const bossNameEl = document.getElementById('boss-name');
    if (bossBar) bossBar.classList.remove('hidden');
    if (bossNameEl) bossNameEl.textContent = boss.name;
  }

  // ==========================================================================
  // MAIN UPDATE & RENDER LOOP
  // ==========================================================================
  gameLoop(timestamp) {
    if (this.isAdShowing) {
      this.lastTime = timestamp;
      requestAnimationFrame((t) => this.gameLoop(t));
      return;
    }

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1) || 0.016;
    this.lastTime = timestamp;

    try {
      if (this.state === 'PLAYING') {
        this.update(dt);
      }
      this.render();
    } catch (loopErr) {
      console.warn('GameLoop frame non-fatal error:', loopErr);
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    if (!this.player) return;
    this.runTime = (this.runTime || 0) + dt;
    this.trackMissionProgress('survive_time', dt);
    this.trackMissionProgress('max_wave', this.wave);

    // 1. Player Movement & Physics
    let mx = 0, my = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) my -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) my += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) mx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) mx += 1;
    if (this.touchJoystick && this.touchJoystick.active) {
      mx = this.touchJoystick.dx;
      my = this.touchJoystick.dy;
    }

    // Downed Player State Handling
    if (this.player.isDowned) {
      this.player.downedTimer -= dt;
      const bleedEl = document.getElementById('hud-bleedout-timer');
      const bleedFill = document.getElementById('hud-downed-fill');
      if (bleedEl) bleedEl.textContent = Math.max(0, Math.ceil(this.player.downedTimer));
      if (bleedFill) bleedFill.style.width = `${Math.max(0, (this.player.downedTimer / 30) * 100)}%`;

      if (this.player.downedTimer <= 0) {
        this.gameOver();
        return;
      }
    }

    const currentSpeed = this.player.isDowned ? 60 : this.player.speed;
    const moveMag = Math.sqrt(mx * mx + my * my);
    if (moveMag > 0.1) {
      mx /= moveMag;
      my /= moveMag;
      this.player.walkCycle = (this.player.walkCycle || 0) + dt * 14 * (currentSpeed / 200);
    } else {
      this.player.walkCycle = (this.player.walkCycle || 0) * 0.85;
    }

    if (this.player.isDashing && !this.player.isDowned) {
      this.player.x += this.player.dashVx * dt;
      this.player.y += this.player.dashVy * dt;
      this.player.dashDuration -= dt;
      if (this.player.dashDuration <= 0) {
        this.player.isDashing = false;
      }
    } else {
      this.player.x += mx * currentSpeed * dt;
      this.player.y += my * currentSpeed * dt;
    }

    // Clamp inside world boundaries
    this.player.x = Math.max(40, Math.min(WORLD_WIDTH - 40, this.player.x));
    this.player.y = Math.max(40, Math.min(WORLD_HEIGHT - 40, this.player.y));

    // Player Aiming (Auto-aim vs Mouse)
    if (this.autoAimEnabled && this.enemies.length > 0) {
      let closest = null, closestDist = 999999;
      this.enemies.forEach((e) => {
        const d = Math.hypot(e.x - this.player.x, e.y - this.player.y);
        if (d < closestDist) { closestDist = d; closest = e; }
      });
      if (closest && closestDist < 700) {
        this.player.angle = Math.atan2(closest.y - this.player.y, closest.x - this.player.x);
      } else {
        this.player.angle = Math.atan2(this.mouse.worldY - this.player.y, this.mouse.worldX - this.player.x);
      }
    } else {
      this.player.angle = Math.atan2(this.mouse.worldY - this.player.y, this.mouse.worldX - this.player.x);
    }

    // Player Cooldowns & Shield Regen
    if (this.player.fireTimer > 0) this.player.fireTimer -= dt;
    if (this.player.dashCooldown > 0) this.player.dashCooldown -= dt;
    if (this.player.specialCooldown > 0) this.player.specialCooldown -= dt;
    if (this.player.ultCooldown > 0) this.player.ultCooldown -= dt;
    if (this.player.invulnTime > 0) this.player.invulnTime -= dt;
    if (this.player.muzzleFlash > 0) this.player.muzzleFlash -= dt;
    if (this.player.recoil > 0) this.player.recoil = Math.max(0, this.player.recoil - dt * 25);

    // Reload Progress Update
    if (this.player.isReloading) {
      this.player.reloadTimer -= dt;
      if (this.player.reloadTimer <= 0) {
        this.player.isReloading = false;
        const curWeap = this.player.currentWeapon || WEAPON_DEFS[this.saveData.primaryWeapon] || WEAPON_DEFS.ak47;
        this.player.ammo[curWeap.id] = curWeap.magSize;
        this.audio.playReloadFinish();
        this.particles.addCombatText(this.player.x, this.player.y - 45, 'RELOADED!', '#00ff88', true);
      }
      this.updateWeaponHUD();
    }

    if (this.player.shield < this.player.maxShield) {
      this.player.shield = Math.min(this.player.maxShield, this.player.shield + this.player.shieldRegenRate * dt);
    }

    // Continuous Primary Firing if holding mouse down
    if (this.mouse.isDown && !this.player.isDowned) {
      this.firePrimaryWeapon();
    }

    // Drone Companion Support Perk
    if (this.player.drones > 0) {
      this.droneAngle = (this.droneAngle || 0) + 2.5 * dt;
      this.droneShootTimer = (this.droneShootTimer || 0) + dt;
      if (this.droneShootTimer > 0.4) {
        this.droneShootTimer = 0;
        const dx = this.player.x + Math.cos(this.droneAngle) * 50;
        const dy = this.player.y + Math.sin(this.droneAngle) * 50;
        let closest = null, minDist = 500;
        this.enemies.forEach((e) => {
          const d = Math.hypot(e.x - dx, e.y - dy);
          if (d < minDist) { minDist = d; closest = e; }
        });
        if (closest) {
          const dAngle = Math.atan2(closest.y - dy, closest.x - dx);
          this.projectiles.push({
            x: dx, y: dy,
            vx: Math.cos(dAngle) * 700,
            vy: Math.sin(dAngle) * 700,
            radius: 4,
            color: '#00f0ff',
            damage: 25 * this.player.damageMult,
            range: 600
          });
        }
      }
    }

    // Micro Missiles Pod Perk
    if (this.player.missiles) {
      this.missileTimer = (this.missileTimer || 0) + dt;
      if (this.missileTimer >= 3.5) {
        this.missileTimer = 0;
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          this.projectiles.push({
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(angle) * 400,
            vy: Math.sin(angle) * 400,
            radius: 6,
            color: '#ffaa00',
            damage: 50 * this.player.damageMult,
            range: 800,
            isHoming: true,
            isMissile: true
          });
        }
      }
    }

    // 2. Projectiles Update
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (p.isHoming) {
        let closest = null, minDist = 600;
        this.enemies.forEach((e) => {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < minDist) { minDist = d; closest = e; }
        });
        if (closest) {
          const targetAngle = Math.atan2(closest.y - p.y, closest.x - p.x);
          const currentAngle = Math.atan2(p.vy, p.vx);
          const newAngle = currentAngle + (targetAngle - currentAngle) * (6 * dt);
          const spd = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(newAngle) * spd;
          p.vy = Math.sin(newAngle) * spd;
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.range -= Math.hypot(p.vx, p.vy) * dt;

      // Grenade fuse
      if (p.isGrenade) {
        p.fuse -= dt;
        if (p.fuse <= 0) {
          p.range = 0;
          this.audio.playExplosion();
          this.particles.addShockwave(p.x, p.y, 90, '#00f0ff', 0.3);
          this.enemies.forEach((e) => {
            if (Math.hypot(e.x - p.x, e.y - p.y) < 90) {
              this.damageEnemy(e, p.damage, true);
            }
          });
        }
      }

      // Ricochet off arena walls
      if (p.bounces > 0) {
        if (p.x < 20 || p.x > WORLD_WIDTH - 20) { p.vx = -p.vx; p.bounces--; }
        if (p.y < 20 || p.y > WORLD_HEIGHT - 20) { p.vy = -p.vy; p.bounces--; }
      }

      // Hit Enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (Math.hypot(e.x - p.x, e.y - p.y) < e.radius + p.radius) {
          this.damageEnemy(e, p.damage, p.isCrit);
          if (p.isCryo) {
            e.slowTimer = 2.5;
            this.particles.addSpark(e.x, e.y, '#00e5ff', 6);
          }
          if (p.isMissile) {
            this.audio.playExplosion();
            this.particles.addShockwave(p.x, p.y, 80, '#ff7700', 0.25);
            this.enemies.forEach((other) => {
              if (other !== e && Math.hypot(other.x - p.x, other.y - p.y) < 80) {
                this.damageEnemy(other, p.damage * 0.7, p.isCrit);
              }
            });
          }
          if (p.pierce && p.pierce > 0) {
            p.pierce--;
          } else {
            p.range = 0;
            break;
          }
        }
      }

      if (p.range <= 0 || p.x < 0 || p.x > WORLD_WIDTH || p.y < 0 || p.y > WORLD_HEIGHT) {
        this.projectiles.splice(i, 1);
      }
    }

    // 3. Enemy Projectiles Update
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.x += ep.vx * dt;
      ep.y += ep.vy * dt;
      ep.range -= Math.hypot(ep.vx, ep.vy) * dt;

      // Hit Player
      if (Math.hypot(this.player.x - ep.x, this.player.y - ep.y) < this.player.radius + ep.radius) {
        this.damagePlayer(ep.damage);
        ep.range = 0;
      }

      // Hit Teammate
      if (this.isPrivateMatch && this.teammate && !this.teammate.isDowned) {
        if (Math.hypot(this.teammate.x - ep.x, this.teammate.y - ep.y) < 18 + ep.radius) {
          this.damageTeammate(ep.damage);
          ep.range = 0;
        }
      }

      if (ep.range <= 0 || ep.x < 0 || ep.x > WORLD_WIDTH || ep.y < 0 || ep.y > WORLD_HEIGHT) {
        this.enemyProjectiles.splice(i, 1);
      }
    }

    // 4. Hazards (Black holes, Orbital Lasers, Vortexes)
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      const h = this.hazards[i];
      h.duration -= dt;
      if (h.followPlayer && this.player) {
        h.x = this.player.x;
        h.y = this.player.y;
      }

      // Pull & damage enemies inside blackhole
      this.enemies.forEach((e) => {
        const dist = Math.hypot(e.x - h.x, e.y - h.y);
        if (dist < h.radius) {
          if (h.type === 'blackhole') {
            const pullAngle = Math.atan2(h.y - e.y, h.x - e.x);
            e.x += Math.cos(pullAngle) * 200 * dt;
            e.y += Math.sin(pullAngle) * 200 * dt;
          }
          this.damageEnemy(e, h.damagePerSec * dt);
        }
      });

      if (h.duration <= 0) {
        this.hazards.splice(i, 1);
      }
    }

    // 5. Enemies Update & AI
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.dead) {
        this.enemies.splice(i, 1);
        continue;
      }

      // Slow & Stun status timers
      if (e.stunTimer > 0) { e.stunTimer -= dt; continue; }
      const currentSpeed = e.slowTimer > 0 ? (e.slowTimer -= dt, e.speed * 0.4) : e.speed;

      const toPlayerAngle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      const distToPlayer = Math.hypot(this.player.x - e.x, this.player.y - e.y);

      // AI Behaviors (Long-Range and Short-Range Attacks for ALL enemies)
      if (e.isBoss) {
        // ==========================================
        // 👑 OVERLORD BOSS AI
        // ==========================================
        e.phaseTimer = (e.phaseTimer || 0) + dt;
        e.x += Math.cos(toPlayerAngle) * currentSpeed * dt;
        e.y += Math.sin(toPlayerAngle) * currentSpeed * dt;

        // Long-Range Attack: Bullet-Hell Spiral and Guided Rockets
        if (e.phaseTimer > 1.2) {
          e.phaseTimer = 0;
          e.attackPhase = (e.attackPhase + 1) % 3;

          if (e.attackPhase === 0) {
            // Spiral barrage
            for (let b = 0; b < 14; b++) {
              const bAngle = (b / 14) * Math.PI * 2;
              this.enemyProjectiles.push({
                x: e.x, y: e.y,
                vx: Math.cos(bAngle) * 260,
                vy: Math.sin(bAngle) * 260,
                radius: 6,
                color: e.color,
                damage: 22,
                range: 750
              });
            }
          } else if (e.attackPhase === 1) {
            // Triple aimed rockets
            for (let r = -1; r <= 1; r++) {
              const rAngle = toPlayerAngle + r * 0.25;
              this.enemyProjectiles.push({
                x: e.x, y: e.y,
                vx: Math.cos(rAngle) * 360,
                vy: Math.sin(rAngle) * 360,
                radius: 8,
                color: '#ffaa00',
                damage: 35,
                range: 900
              });
            }
          }
        }

        // Short-Range Attack: Boss Radial Shockwave Slam
        if (distToPlayer < e.radius + this.player.radius + 60) {
          e.meleeTimer = (e.meleeTimer || 0) - dt;
          if (e.meleeTimer <= 0) {
            e.meleeTimer = 1.2;
            this.damagePlayer(e.damage);
            this.particles.addShockwave(e.x, e.y, 130, e.color, 0.4);
            this.particles.addCombatText(this.player.x, this.player.y, 'BOSS SLAM!', e.color, true);
          }
        }
      } else if (e.type === 'scrapper') {
        // ==========================================
        // 🔴 RED VIRUS (Scrapper Drone)
        // ==========================================
        e.x += Math.cos(toPlayerAngle) * currentSpeed * dt;
        e.y += Math.sin(toPlayerAngle) * currentSpeed * dt;

        // Long-Range Attack: Crimson Plasma Dart
        e.shootTimer = (e.shootTimer || 0) - dt;
        if (e.shootTimer <= 0 && distToPlayer > 120 && distToPlayer < 750) {
          e.shootTimer = 2.4 + Math.random() * 0.8;
          this.enemyProjectiles.push({
            x: e.x, y: e.y,
            vx: Math.cos(toPlayerAngle) * 330,
            vy: Math.sin(toPlayerAngle) * 330,
            radius: 5,
            color: '#ff2a4b',
            damage: Math.max(10, Math.round(e.damage * 0.75)),
            range: 650
          });
          this.particles.addSpark(e.x, e.y, '#ff2a4b', 4);
        }

        // Short-Range Attack: Claw Melee Slash
        if (distToPlayer < e.radius + this.player.radius) {
          this.damagePlayer(e.damage);
          this.particles.addCombatText(this.player.x, this.player.y, 'SLASH!', '#ff2a4b');
          e.x -= Math.cos(toPlayerAngle) * 35;
          e.y -= Math.sin(toPlayerAngle) * 35;
        }
      } else if (e.type === 'stalker') {
        // ==========================================
        // 💖 PINK VIRUS (Stalker Runner)
        // ==========================================
        e.x += Math.cos(toPlayerAngle) * currentSpeed * dt;
        e.y += Math.sin(toPlayerAngle) * currentSpeed * dt;

        // Long-Range Attack: Twin Neon Pink Energy Slices
        e.shootTimer = (e.shootTimer || 0) - dt;
        if (e.shootTimer <= 0 && distToPlayer > 110 && distToPlayer < 700) {
          e.shootTimer = 2.0 + Math.random() * 0.8;
          for (let offset of [-0.12, 0.12]) {
            const shotAngle = toPlayerAngle + offset;
            this.enemyProjectiles.push({
              x: e.x, y: e.y,
              vx: Math.cos(shotAngle) * 370,
              vy: Math.sin(shotAngle) * 370,
              radius: 5,
              color: '#ff007f',
              damage: Math.max(12, Math.round(e.damage * 0.8)),
              range: 600
            });
          }
          this.particles.addSpark(e.x, e.y, '#ff007f', 6);
        }

        // Short-Range Attack: Plasma Blade Strike
        if (distToPlayer < e.radius + this.player.radius) {
          this.damagePlayer(e.damage);
          this.particles.addShockwave(e.x, e.y, 45, '#ff007f', 0.2);
          this.particles.addCombatText(this.player.x, this.player.y, 'BLADE HIT!', '#ff007f');
          e.x -= Math.cos(toPlayerAngle) * 45;
          e.y -= Math.sin(toPlayerAngle) * 45;
        }
      } else if (e.type === 'goliath') {
        // ==========================================
        // 🟡 YELLOW VIRUS (Goliath Heavy Mech)
        // ==========================================
        e.x += Math.cos(toPlayerAngle) * currentSpeed * dt;
        e.y += Math.sin(toPlayerAngle) * currentSpeed * dt;

        // Long-Range Attack: Golden Cannonball Rocket
        e.shootTimer = (e.shootTimer || 0) - dt;
        if (e.shootTimer <= 0 && distToPlayer > 130 && distToPlayer < 800) {
          e.shootTimer = 2.8 + Math.random() * 0.9;
          this.enemyProjectiles.push({
            x: e.x, y: e.y,
            vx: Math.cos(toPlayerAngle) * 300,
            vy: Math.sin(toPlayerAngle) * 300,
            radius: 8,
            color: '#ffcc00',
            damage: Math.max(18, Math.round(e.damage * 0.9)),
            range: 750
          });
          this.particles.addShockwave(e.x, e.y, 30, '#ffcc00', 0.15);
        }

        // Short-Range Attack: Heavy Ground Shockwave Slam
        if (distToPlayer < e.radius + this.player.radius + 15) {
          this.damagePlayer(e.damage);
          this.particles.addShockwave(e.x, e.y, 80, '#ffcc00', 0.35);
          this.particles.addCombatText(this.player.x, this.player.y, 'HEAVY SLAM!', '#ffcc00');
          e.x -= Math.cos(toPlayerAngle) * 50;
          e.y -= Math.sin(toPlayerAngle) * 50;
        }
      } else if (e.type === 'sniper') {
        // ==========================================
        // 🎯 CYAN SNIPER
        // ==========================================
        if (distToPlayer < 350) {
          e.x -= Math.cos(toPlayerAngle) * currentSpeed * dt;
          e.y -= Math.sin(toPlayerAngle) * currentSpeed * dt;
        } else {
          e.x += Math.cos(toPlayerAngle) * (currentSpeed * 0.5) * dt;
          e.y += Math.sin(toPlayerAngle) * (currentSpeed * 0.5) * dt;
        }

        // Long-Range Attack: High Velocity Railgun Beam
        e.shootTimer = (e.shootTimer || 0) - dt;
        if (e.shootTimer <= 0) {
          e.shootTimer = Math.max(1.5, 3.0 - this.wave * 0.1);
          this.enemyProjectiles.push({
            x: e.x, y: e.y,
            vx: Math.cos(toPlayerAngle) * 580,
            vy: Math.sin(toPlayerAngle) * 580,
            radius: 5,
            color: '#00f0ff',
            damage: e.damage,
            range: 880
          });
        }

        // Short-Range Attack: Point-blank EMP burst & pushback
        if (distToPlayer < e.radius + this.player.radius + 25) {
          this.damagePlayer(Math.round(e.damage * 0.6));
          this.particles.addShockwave(e.x, e.y, 50, '#00f0ff', 0.25);
          e.x -= Math.cos(toPlayerAngle) * 70;
          e.y -= Math.sin(toPlayerAngle) * 70;
        }
      } else if (e.type === 'kamikaze') {
        // ==========================================
        // 💥 ORANGE KAMIKAZE
        // ==========================================
        e.x += Math.cos(toPlayerAngle) * currentSpeed * dt;
        e.y += Math.sin(toPlayerAngle) * currentSpeed * dt;

        // Long-Range Attack: Volatile Fire Dart
        e.shootTimer = (e.shootTimer || 0) - dt;
        if (e.shootTimer <= 0 && distToPlayer > 160 && distToPlayer < 600) {
          e.shootTimer = 1.8;
          this.enemyProjectiles.push({
            x: e.x, y: e.y,
            vx: Math.cos(toPlayerAngle) * 360,
            vy: Math.sin(toPlayerAngle) * 360,
            radius: 4,
            color: '#ff5500',
            damage: 15,
            range: 500
          });
        }

        // Short-Range Attack: Thermal Detonation
        e.fuse -= dt;
        if (e.fuse <= 0 || distToPlayer < e.radius + this.player.radius) {
          this.damagePlayer(e.damage);
          this.audio.playExplosion();
          this.particles.addShockwave(e.x, e.y, 90, '#ff5500');
          this.particles.addCombatText(this.player.x, this.player.y, 'DETONATION!', '#ff5500');
          e.dead = true;
        }
      } else if (e.type === 'shield') {
        // ==========================================
        // 🛡️ EMERALD SHIELDER
        // ==========================================
        e.x += Math.cos(toPlayerAngle) * currentSpeed * dt;
        e.y += Math.sin(toPlayerAngle) * currentSpeed * dt;

        // Long-Range Attack: Emerald Pulse Orb
        e.shootTimer = (e.shootTimer || 0) - dt;
        if (e.shootTimer <= 0 && distToPlayer > 130) {
          e.shootTimer = 2.5 + Math.random() * 0.8;
          this.enemyProjectiles.push({
            x: e.x, y: e.y,
            vx: Math.cos(toPlayerAngle) * 290,
            vy: Math.sin(toPlayerAngle) * 290,
            radius: 6,
            color: '#00ff88',
            damage: 16,
            range: 650
          });
        }

        // Short-Range Attack: Shield Bash
        if (distToPlayer < e.radius + this.player.radius) {
          this.damagePlayer(e.damage);
          this.particles.addShockwave(e.x, e.y, 60, '#00ff88', 0.2);
          e.x -= Math.cos(toPlayerAngle) * 40;
          e.y -= Math.sin(toPlayerAngle) * 40;
        }
      }
    }

    // 6. Pickups Magnet & Collection
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      const dist = Math.hypot(this.player.x - p.x, this.player.y - p.y);

      // Magnet attraction
      if (dist < this.player.magnetRadius) {
        const angle = Math.atan2(this.player.y - p.y, this.player.x - p.x);
        p.x += Math.cos(angle) * 500 * dt;
        p.y += Math.sin(angle) * 500 * dt;
      }

      // Collect
      if (dist < this.player.radius + p.radius) {
        if (p.type === 'xp') {
          this.gainXp(p.val);
        } else if (p.type === 'credit') {
          this.runCredits += p.val;
          this.trackMissionProgress('credits', p.val);
          this.audio.playCoin();
        } else if (p.type === 'heal') {
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + p.val);
          this.particles.addCombatText(this.player.x, this.player.y, `+${p.val} HP`, '#00ff88');
        }
        this.pickups.splice(i, 1);
      }
    }

    // 7. Combo Decay
    if (this.comboCount > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        if (this.comboCount > this.saveData.maxCombo) {
          this.saveData.maxCombo = this.comboCount;
          SaveManager.save(this.saveData);
        }
        this.comboCount = 0;
      }
    }

    // 8. Wave & Director
    this.updateWaveDirector(dt);

    // 9. Camera Tracking & Shake
    const targetCamX = this.player.x - this.camera.width / 2;
    const targetCamY = this.player.y - this.camera.height / 2;
    this.camera.x += (targetCamX - this.camera.x) * (8 * dt);
    this.camera.y += (targetCamY - this.camera.y) * (8 * dt);

    if (this.camera.shakeTrauma > 0) {
      this.camera.shakeTrauma = Math.max(0, this.camera.shakeTrauma - 1.8 * dt);
      const shakeAmount = Math.pow(this.camera.shakeTrauma, 2) * (30 * (this.saveData.settings.shake / 100));
      this.camera.x += (Math.random() - 0.5) * shakeAmount;
      this.camera.y += (Math.random() - 0.5) * shakeAmount;
    }

    // 10. Update Particles & HUD
    this.particles.update(dt);
    this.updateHUD();

    // 11. 4-Player Co-Op Squad Network Synchronization & Revive Tethers
    if (this.isPrivateMatch) {
      this.syncSquadNetworkState(dt);
      this.handleSquadReviveTethers(dt);
    }
  }

  damagePlayer(amount) {
    if (this.player.invulnTime > 0) return;
    this.player.invulnTime = 0.3;
    this.addScreenShake(0.45);
    this.audio.playHit(false);

    // Damage shield first
    if (this.player.shield > 0) {
      const shieldDmg = Math.min(this.player.shield, amount);
      this.player.shield -= shieldDmg;
      amount -= shieldDmg;
      this.particles.addSpark(this.player.x, this.player.y, '#00f0ff', 8);
    }

    // Remaining damage to HP
    if (amount > 0) {
      this.player.hp -= amount;
      this.particles.addBlood(this.player.x, this.player.y, '#ff0055', 10);
    }

    // Reactive Armor Perk on damage
    if (this.player.reactiveArmor) {
      this.particles.addShockwave(this.player.x, this.player.y, 160, '#ffaa00', 0.3);
      this.enemies.forEach((e) => {
        if (Math.hypot(e.x - this.player.x, e.y - this.player.y) < 160) {
          e.hp -= 40 * this.player.damageMult;
        }
      });
    }

    if (this.player.hp <= 0) {
      this.player.hp = 0;
      const anyTeammateAlive = this.isPrivateMatch && this.squadMembers.some(m => !m.isDowned);
      if (anyTeammateAlive) {
        this.enterPlayerDownedState();
      } else {
        this.gameOver();
      }
    }
  }

  // ==========================================================================
  // 4-PLAYER REAL-TIME SQUAD CO-OP SYSTEM (PEERJS & GOOGLE STUN)
  // ==========================================================================

  generateSquadRoomCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `CYBER-${code}`;
  }

  openSquadLobbyModal(initialTab = 'create') {
    const modal = document.getElementById('squad-lobby-modal');
    if (!modal) return;
    modal.classList.remove('hidden');

    this.switchSquadLobbyTab(initialTab);

    if (initialTab === 'create') {
      if (!this.roomCode || !this.isHost) {
        this.roomCode = this.generateSquadRoomCode();
      }
      const codeDisplay = document.getElementById('squad-generated-code');
      if (codeDisplay) codeDisplay.textContent = this.roomCode;
      this.initSquadHost(this.roomCode);
    }
  }

  closeSquadLobbyModal() {
    const modal = document.getElementById('squad-lobby-modal');
    if (modal) modal.classList.add('hidden');
    // If we're not actually in a match, clean up network resources
    if (this.state !== 'PLAYING') {
      this.cleanupSquadNetwork();
      this.isPrivateMatch = false;
    }
  }

  switchSquadLobbyTab(tabName) {
    const btnCreate = document.getElementById('tab-btn-create-squad');
    const btnJoin = document.getElementById('tab-btn-join-squad');
    const viewCreate = document.getElementById('view-create-squad');
    const viewJoin = document.getElementById('view-join-squad');

    if (tabName === 'create') {
      btnCreate?.classList.add('active');
      btnJoin?.classList.remove('active');
      viewCreate?.classList.add('active');
      viewJoin?.classList.remove('active');

      if (!this.roomCode || !this.isHost) {
        this.roomCode = this.generateSquadRoomCode();
        const codeDisplay = document.getElementById('squad-generated-code');
        if (codeDisplay) codeDisplay.textContent = this.roomCode;
        this.initSquadHost(this.roomCode);
      }
    } else {
      btnJoin?.classList.add('active');
      btnCreate?.classList.remove('active');
      viewJoin?.classList.add('active');
      viewCreate?.classList.remove('active');
      const input = document.getElementById('input-join-squad-code');
      if (input) input.focus();
    }
  }

  cleanupSquadNetwork() {
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (err) {}
      this.peer = null;
    }
    if (this.hostConn) {
      try {
        this.hostConn.close();
      } catch (err) {}
      this.hostConn = null;
    }
    if (this.squadPeers) {
      this.squadPeers.forEach((p) => {
        try { if (p.conn) p.conn.close(); } catch (e) {}
      });
      this.squadPeers.clear();
    }
    if (this.localNetChannel) {
      try { this.localNetChannel.close(); } catch (e) {}
      this.localNetChannel = null;
    }
    this.squadMembers = [];
    this.teammate = null;
  }

  initSquadHost(roomCode) {
    this.cleanupSquadNetwork();
    this.isPrivateMatch = true;
    this.isHost = true;
    this.mySlot = 1;
    this.roomCode = roomCode;
    this.squadPeers = new Map();
    this.squadMembers = [];

    const cleanCode = roomCode.replace(/[^A-Z0-9]/g, '');
    const peerId = this.roomCodePrefix + cleanCode;

    try {
      if (typeof Peer !== 'undefined') {
        this.peer = new Peer(peerId, {
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        this.peer.on('open', (id) => {
          console.log('[Squad Host] Registered PeerJS ID:', id);
          this.updateSquadLobbyUI();
        });

        this.peer.on('connection', (conn) => {
          this.handleHostIncomingConnection(conn);
        });

        this.peer.on('error', (err) => {
          console.warn('[Squad Host] Peer error:', err);
          if (err.type === 'unavailable-id') {
            this.roomCode = this.generateSquadRoomCode();
            const codeEl = document.getElementById('squad-generated-code');
            if (codeEl) codeEl.textContent = this.roomCode;
            this.initSquadHost(this.roomCode);
          }
        });
      }
    } catch (err) {
      console.warn('[Squad Host] PeerJS exception:', err);
    }

    // Local BroadcastChannel fallback for multi-window same-machine testing
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.localNetChannel = new BroadcastChannel('squad_local_' + cleanCode);
        this.localNetChannel.onmessage = (ev) => this.handleHostNetworkPacket(ev.data, null);
      }
    } catch (e) {}

    this.updateSquadLobbyUI();
  }

  joinSquadRoom(roomCode) {
    this.cleanupSquadNetwork();
    this.isPrivateMatch = true;
    this.isHost = false;
    this.mySlot = 0;
    this.roomCode = roomCode.toUpperCase().trim();
    this.squadMembers = [];

    const cleanCode = this.roomCode.replace(/[^A-Z0-9]/g, '');
    const hostPeerId = this.roomCodePrefix + cleanCode;
    const clientPeerId = this.roomCodePrefix + cleanCode + '_p_' + Math.random().toString(36).substring(2, 7);

    this.updateJoinStatus('📡 INITIALIZING...', `Connecting to Google STUN servers for squad ${this.roomCode}...`, false);

    try {
      if (typeof Peer !== 'undefined') {
        this.peer = new Peer(clientPeerId, {
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          }
        });

        this.peer.on('open', () => {
          this.updateJoinStatus('🔗 CONNECTING...', `Contacting Squad Host at ${this.roomCode}...`, false);
          const conn = this.peer.connect(hostPeerId, { reliable: true });
          this.setupClientConnection(conn);
        });

        this.peer.on('error', (err) => {
          console.warn('[Squad Client] Peer error:', err);
          this.updateJoinStatus('⚠️ CONNECTION ERROR', `Failed to locate host: ${err.message || err.type}. Verify room code and ensure host is waiting in lobby.`, true);
        });
      }
    } catch (err) {
      console.warn('[Squad Client] PeerJS exception:', err);
    }

    // Local fallback
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.localNetChannel = new BroadcastChannel('squad_local_' + cleanCode);
        this.localNetChannel.onmessage = (ev) => this.handleClientNetworkPacket(ev.data);
        this.localNetChannel.postMessage({
          type: 'JOIN_REQ',
          clientId: clientPeerId,
          name: this.saveData.playerName || 'Operative',
          heroId: this.selectedHero || 'commando',
          weaponId: this.saveData.primaryWeapon || 'ak47'
        });
      }
    } catch (e) {}
  }

  handleHostIncomingConnection(conn) {
    const handleOpen = () => {
      console.log('[Squad Host] New peer connected and channel OPEN:', conn.peer);
    };
    if (conn.open) {
      handleOpen();
    } else {
      conn.on('open', handleOpen);
    }

    conn.on('data', (data) => {
      console.log('Received peer update:', data);
      this.handleHostNetworkPacket(data, conn);
    });

    conn.on('close', () => {
      console.log('[Squad Host] Data channel closed:', conn.peer);
      this.removeSquadPeer(conn.peer);
    });

    conn.on('error', (err) => {
      console.warn('[Squad Host] Conn error with peer:', conn.peer, err);
      this.removeSquadPeer(conn.peer);
    });
  }

  setupClientConnection(conn) {
    this.hostConn = conn;

    const handleOpen = () => {
      console.log('[Squad Client] Connected and data channel OPEN to host:', conn.peer);
      this.updateJoinStatus('🤝 LINKING...', 'Connected to host! Sending operative credentials...', false);
      const joinReq = {
        type: 'JOIN_REQ',
        id: this.localPlayerId || this.peer?.id,
        name: this.saveData.playerName || 'Operative',
        heroId: this.selectedHero || 'commando',
        weaponId: this.saveData.primaryWeapon || 'ak47'
      };
      if (conn && conn.open) {
        conn.send(joinReq);
      }
    };

    if (conn.open) {
      handleOpen();
    } else {
      conn.on('open', handleOpen);
    }

    conn.on('data', (data) => {
      console.log('Received peer update:', data);
      this.handleClientNetworkPacket(data);
    });

    conn.on('close', () => {
      console.log('[Squad Client] Data channel to host closed.');
      this.updateJoinStatus('🔌 DISCONNECTED', 'Host closed connection or session ended.', true);
      document.getElementById('client-squad-preview')?.classList.add('hidden');
    });

    conn.on('error', (err) => {
      console.warn('[Squad Client] Conn error:', err);
      this.updateJoinStatus('⚠️ LINK ERROR', 'Failed to maintain data link with host.', true);
    });
  }

  removeSquadPeer(peerId) {
    if (this.squadPeers.has(peerId)) {
      const removed = this.squadPeers.get(peerId);
      this.squadPeers.delete(peerId);
      this.showNotification(`${removed.name} left the squad.`, 'TEAMMATE DISCONNECTED', 'red');
      this.broadcastSquadRoster();
      this.updateSquadLobbyUI();
      if (this.state === 'PLAYING') {
        this.squadMembers = this.squadMembers.filter(m => m.peerId !== peerId && m.id !== peerId);
        this.updateMultiplayerSquadHUD();
      }
    }
  }

  // Unified real-time PLAYER_UPDATE handler for both Host and Client
  handlePlayerUpdate(data) {
    if (!data) return;

    // Ignore self updates
    const myId = this.peer ? this.peer.id : this.localPlayerId;
    if (data.id && (data.id === myId || data.id === this.localPlayerId)) {
      return;
    }
    if (data.slot && data.slot === this.mySlot) {
      return;
    }

    // Locate remote player instance in this.squadMembers
    let remotePlayer = this.squadMembers.find((m) =>
      (data.id && (m.id === data.id || m.peerId === data.id)) ||
      (data.slot && m.slot === data.slot)
    );

    // If not found in squadMembers yet (e.g. joined during match or packet arrived before roster rebuild), create it dynamically
    if (!remotePlayer && data.slot && data.slot !== this.mySlot) {
      const slotDef = SQUAD_SLOT_DEFS[(data.slot || 1) - 1] || SQUAD_SLOT_DEFS[0];
      remotePlayer = {
        id: data.id || ('slot_' + data.slot),
        peerId: data.id || ('slot_' + data.slot),
        slot: data.slot,
        name: data.name || (data.slot === 1 ? 'Host Operative' : `Operative_P${data.slot}`),
        hero: HERO_DEFS[data.heroId] || HERO_DEFS.commando,
        heroId: data.heroId || 'commando',
        color: slotDef.color,
        weapon: WEAPON_DEFS[data.weaponId] || WEAPON_DEFS.ak47,
        currentWeapon: WEAPON_DEFS[data.weaponId] || WEAPON_DEFS.ak47,
        x: typeof data.x === 'number' ? data.x : WORLD_WIDTH / 2,
        y: typeof data.y === 'number' ? data.y : WORLD_HEIGHT / 2,
        angle: typeof data.angle === 'number' ? data.angle : 0,
        hp: typeof data.hp === 'number' ? data.hp : 150,
        maxHp: typeof data.maxHp === 'number' ? data.maxHp : 150,
        shield: typeof data.shield === 'number' ? data.shield : 50,
        maxShield: typeof data.maxShield === 'number' ? data.maxShield : 50,
        isDowned: Boolean(data.isDowned),
        downedTimer: typeof data.downedTimer === 'number' ? data.downedTimer : 0,
        reviveProgress: 0,
        shooting: Boolean(data.shooting),
        walkTimer: 0,
        isHuman: true
      };
      this.squadMembers.push(remotePlayer);
    }

    if (remotePlayer) {
      // Direct coordinate updates: no broken interpolation, no division by zero
      if (typeof data.x === 'number' && !isNaN(data.x)) remotePlayer.x = data.x;
      if (typeof data.y === 'number' && !isNaN(data.y)) remotePlayer.y = data.y;
      if (typeof data.angle === 'number' && !isNaN(data.angle)) remotePlayer.angle = data.angle;
      if (typeof data.hp === 'number' && !isNaN(data.hp)) remotePlayer.hp = data.hp;
      if (typeof data.maxHp === 'number' && !isNaN(data.maxHp)) remotePlayer.maxHp = data.maxHp;
      if (typeof data.shield === 'number' && !isNaN(data.shield)) remotePlayer.shield = data.shield;
      if (typeof data.maxShield === 'number' && !isNaN(data.maxShield)) remotePlayer.maxShield = data.maxShield;
      if (typeof data.isDowned === 'boolean') remotePlayer.isDowned = data.isDowned;
      if (typeof data.downedTimer === 'number') remotePlayer.downedTimer = data.downedTimer;
      if (data.weaponId && WEAPON_DEFS[data.weaponId]) {
        remotePlayer.weapon = WEAPON_DEFS[data.weaponId];
        remotePlayer.currentWeapon = WEAPON_DEFS[data.weaponId];
      }

      remotePlayer.shooting = Boolean(data.shooting);
      if (remotePlayer.shooting && !remotePlayer.isDowned) {
        this.fireSquadPeerBullet(remotePlayer, remotePlayer.angle);
      }
    }

    // If host: update squadPeers and relay to all other peers so P2, P3, P4 can see each other
    if (this.isHost) {
      if (this.squadPeers && data.id) {
        const peerObj = this.squadPeers.get(data.id);
        if (peerObj) {
          peerObj.x = data.x;
          peerObj.y = data.y;
          peerObj.angle = data.angle;
          peerObj.hp = data.hp;
          peerObj.shield = data.shield;
          peerObj.isDowned = data.isDowned;
        }
      }

      if (this.squadPeers) {
        this.squadPeers.forEach((p, peerId) => {
          if (peerId !== data.id && p.conn && p.conn.open) {
            try { p.conn.send(data); } catch (e) {}
          }
        });
      }
    }

    this.updateMultiplayerSquadHUD();
  }

  handleHostNetworkPacket(data, conn) {
    if (!data) return;

    if (data.type === 'PLAYER_UPDATE' || data.type === 'CLIENT_INPUT') {
      this.handlePlayerUpdate(data);
      return;
    }

    if (data.type === 'JOIN_REQ') {
      const peerId = (conn ? conn.peer : data.id || data.clientId) || ('peer_' + Math.random().toString(36).substring(2, 7));

      // Check if room is full (Host + 3 teammates = 4 max)
      if (this.squadPeers.size >= 3) {
        if (conn && conn.open) conn.send({ type: 'JOIN_REJECT', reason: 'Squad is full (4/4 players).' });
        return;
      }

      // Determine lowest available slot (2, 3, 4)
      const takenSlots = new Set([1]);
      this.squadPeers.forEach(p => takenSlots.add(p.slot));
      let assignedSlot = 2;
      for (let s = 2; s <= 4; s++) {
        if (!takenSlots.has(s)) {
          assignedSlot = s;
          break;
        }
      }

      const peerHero = HERO_DEFS[data.heroId] || HERO_DEFS.commando;
      const peerWeap = WEAPON_DEFS[data.weaponId] || WEAPON_DEFS.ak47;
      const slotDef = SQUAD_SLOT_DEFS[assignedSlot - 1];

      const newPeer = {
        id: peerId,
        peerId: peerId,
        conn: conn,
        slot: assignedSlot,
        name: data.name || `Operative_P${assignedSlot}`,
        heroId: data.heroId || 'commando',
        hero: peerHero,
        color: slotDef.color,
        weaponId: data.weaponId || 'ak47',
        currentWeapon: peerWeap,
        weapon: peerWeap,
        x: WORLD_WIDTH / 2 + (assignedSlot === 2 ? 80 : assignedSlot === 3 ? -80 : 0),
        y: WORLD_HEIGHT / 2 + (assignedSlot === 4 ? 80 : -60),
        angle: 0,
        hp: peerHero.hp + 50,
        maxHp: peerHero.hp + 50,
        shield: peerHero.shield + 20,
        maxShield: peerHero.shield + 20,
        isDowned: false,
        downedTimer: 0,
        reviveProgress: 0,
        isShooting: false,
        shooting: false,
        walkTimer: 0,
        isHuman: true
      };

      this.squadPeers.set(peerId, newPeer);

      // If match is currently in progress, add to squadMembers immediately
      if (this.state === 'PLAYING') {
        if (!this.squadMembers.some(m => m.id === peerId || m.slot === assignedSlot)) {
          this.squadMembers.push(newPeer);
        }
      }

      // Send ACK back to the new player
      const ackPacket = {
        type: 'JOIN_ACK',
        assignedSlot: assignedSlot,
        roomCode: this.roomCode,
        squadRoster: this.getSquadRosterSnapshot()
      };
      if (conn && conn.open) conn.send(ackPacket);
      if (this.localNetChannel) this.localNetChannel.postMessage(ackPacket);

      // Broadcast updated squad roster to all peers
      this.broadcastSquadRoster();
      this.showNotification(`${newPeer.name} connected to squad (P${assignedSlot})!`, 'OPERATIVE JOINED', 'green');
      this.audio.playLevelUp();
      this.updateSquadLobbyUI();
    } else if (data.type === 'REVIVE_SYNC') {
      const targetPeer = this.squadPeers.get(data.targetPeerId);
      if (targetPeer) {
        targetPeer.reviveProgress = data.progress;
        if (targetPeer.reviveProgress >= 1.0) {
          targetPeer.isDowned = false;
          targetPeer.hp = Math.round(targetPeer.maxHp * 0.5);
          targetPeer.shield = Math.round(targetPeer.maxShield * 0.5);
          targetPeer.downedTimer = 0;
          targetPeer.reviveProgress = 0;
          this.broadcastToSquad({ type: 'REVIVE_SUCCESS', peerId: data.targetPeerId });
        }
      }
    }
  }

  handleClientNetworkPacket(data) {
    if (!data) return;

    if (data.type === 'PLAYER_UPDATE' || data.type === 'CLIENT_INPUT') {
      this.handlePlayerUpdate(data);
      return;
    }

    if (data.type === 'JOIN_ACK') {
      this.mySlot = data.assignedSlot;
      this.roomCode = data.roomCode;
      this.updateJoinStatus('✅ LINK ESTABLISHED', `Connected as P${this.mySlot}! Waiting for Host to start match...`, false);
      this.renderClientSquadPreview(data.squadRoster);
      this.showNotification(`Joined Squad as P${this.mySlot}!`, 'SQUAD SYNCED', 'green');
      this.audio.playLevelUp();
    } else if (data.type === 'JOIN_REJECT') {
      this.updateJoinStatus('🚫 REJECTED', data.reason || 'Could not join room.', true);
    } else if (data.type === 'SQUAD_UPDATE') {
      this.renderClientSquadPreview(data.squadRoster);
    } else if (data.type === 'MATCH_START') {
      try {
        console.log('[Squad Client] Received MATCH_START:', data);
        this.buildSquadMembersListFromRoster(data.squadRoster);
        document.getElementById('squad-lobby-modal')?.classList.add('hidden');
        this.showNotification('Host launched the squad match! Deploying...', 'MATCH COMMENCED', 'green');
        this.startRun();
      } catch (err) {
        console.error('[Squad Client] Error starting run on MATCH_START:', err);
      }
    } else if (data.type === 'HOST_SYNC') {
      this.applyHostSync(data);
    } else if (data.type === 'REVIVE_SUCCESS') {
      if (data.peerId === this.peer?.id || this.mySlot === data.slot) {
        this.reviveLocalPlayer();
      }
    }
  }

  getSquadRosterSnapshot() {
    const hostHero = HERO_DEFS[this.selectedHero] || HERO_DEFS.commando;
    const roster = [
      {
        slot: 1,
        isHost: true,
        name: this.saveData.playerName || 'Operative (Host)',
        heroId: this.selectedHero || 'commando',
        heroName: hostHero.name,
        heroIcon: hostHero.icon || '🚀',
        color: SQUAD_SLOT_DEFS[0].color,
        weaponId: this.player?.currentWeapon?.id || this.saveData.primaryWeapon || 'ak47'
      }
    ];

    this.squadPeers.forEach((p) => {
      roster.push({
        slot: p.slot,
        isHost: false,
        peerId: p.peerId,
        name: p.name,
        heroId: p.heroId,
        heroName: p.hero?.name || 'Operative',
        heroIcon: p.hero?.icon || '👤',
        color: p.color,
        weaponId: p.weaponId
      });
    });

    return roster;
  }

  broadcastToSquad(packet) {
    if (this.squadPeers) {
      this.squadPeers.forEach((p) => {
        try {
          if (p.conn && p.conn.open) p.conn.send(packet);
        } catch (e) {}
      });
    }
    if (this.localNetChannel) {
      try { this.localNetChannel.postMessage(packet); } catch (e) {}
    }
  }

  broadcastSquadRoster() {
    const roster = this.getSquadRosterSnapshot();
    this.broadcastToSquad({
      type: 'SQUAD_UPDATE',
      squadRoster: roster
    });
  }

  updateSquadLobbyUI() {
    const countVal = document.getElementById('squad-count-val');
    const totalCount = this.squadPeers.size + 1; // Host + peers
    if (countVal) countVal.textContent = `${totalCount} / 4 READY`;

    // Host slot 1
    const hostHero = HERO_DEFS[this.selectedHero] || HERO_DEFS.commando;
    const s1Name = document.getElementById('slot-1-name');
    const s1Hero = document.getElementById('slot-1-hero');
    const s1Avatar = document.getElementById('slot-1-avatar');
    if (s1Name) s1Name.textContent = (this.saveData.playerName || 'OPERATIVE') + ' (YOU)';
    if (s1Hero) s1Hero.textContent = hostHero.name;
    if (s1Avatar) s1Avatar.textContent = hostHero.icon || '🚀';

    // Slots 2, 3, 4
    const peerList = Array.from(this.squadPeers.values());
    for (let slot = 2; slot <= 4; slot++) {
      const card = document.getElementById(`slot-card-${slot}`);
      const nameEl = document.getElementById(`slot-${slot}-name`);
      const heroEl = document.getElementById(`slot-${slot}-hero`);
      const avatarEl = document.getElementById(`slot-${slot}-avatar`);
      const statusEl = document.getElementById(`slot-${slot}-status`);

      const peer = peerList.find(p => p.slot === slot);
      if (peer) {
        if (card) {
          card.className = `squad-slot-card connected-slot p${slot}-slot`;
        }
        if (nameEl) nameEl.textContent = peer.name;
        if (heroEl) heroEl.textContent = peer.hero?.name || 'Operative';
        if (avatarEl) avatarEl.innerHTML = `<span>${peer.hero?.icon || '👤'}</span>`;
        if (statusEl) {
          statusEl.className = 'slot-status ready';
          statusEl.innerHTML = '<span class="status-dot"></span> CONNECTED (READY)';
        }
      } else {
        if (card) {
          card.className = 'squad-slot-card empty-slot';
        }
        if (nameEl) nameEl.textContent = 'EMPTY SLOT';
        if (heroEl) heroEl.textContent = 'Waiting for player...';
        if (avatarEl) {
          avatarEl.innerHTML = '<div class="radar-scan-anim"></div><span>👤</span>';
        }
        if (statusEl) {
          statusEl.className = 'slot-status waiting';
          statusEl.innerHTML = '<span class="status-dot pulsing"></span> WAITING FOR SQUAD';
        }
      }
    }

    // Host Launch Button: Unlocks when at least 1 teammate connects (2-4 real players)
    const launchBtn = document.getElementById('btn-start-squad-match');
    if (launchBtn) {
      if (this.squadPeers.size >= 1) {
        launchBtn.disabled = false;
        launchBtn.classList.remove('disabled');
        launchBtn.innerHTML = `<span>🚀 START SQUAD MATCH (${totalCount}/4 READY)</span>`;
      } else {
        launchBtn.disabled = true;
        launchBtn.classList.add('disabled');
        launchBtn.innerHTML = '<span>⏳ WAITING FOR AT LEAST 1 TEAMMATE...</span>';
      }
    }
  }

  updateJoinStatus(title, desc, isError) {
    const titleEl = document.getElementById('join-status-title');
    const descEl = document.getElementById('join-status-desc');
    const iconEl = document.getElementById('join-status-icon');
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    if (iconEl) iconEl.textContent = isError ? '⚠️' : '📡';
  }

  renderClientSquadPreview(roster) {
    const previewBox = document.getElementById('client-squad-preview');
    const slotsRow = document.getElementById('client-preview-slots-row');
    if (!previewBox || !slotsRow || !roster) return;

    previewBox.classList.remove('hidden');
    slotsRow.innerHTML = '';

    roster.forEach((p) => {
      const isMe = (p.slot === this.mySlot);
      const slotDef = SQUAD_SLOT_DEFS[p.slot - 1] || SQUAD_SLOT_DEFS[0];
      const pill = document.createElement('div');
      pill.className = `preview-player-pill p${p.slot}`;
      pill.style.cssText = `display: flex; align-items: center; gap: 6px; background: rgba(15,23,42,0.85); border: 1px solid ${slotDef.color}; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem;`;
      pill.innerHTML = `
        <span>${p.heroIcon || '👤'}</span>
        <strong style="color: ${slotDef.color};">[${slotDef.title}] ${p.name}${isMe ? ' (YOU)' : ''}</strong>
        <span style="font-size: 0.7rem; color: #94a3b8;">${p.heroName || ''}</span>
      `;
      slotsRow.appendChild(pill);
    });
  }

  buildSquadMembersList() {
    this.squadMembers = [];
    this.teammate = null; // No AI bot

    this.squadPeers.forEach((p) => {
      this.squadMembers.push({
        id: p.peerId || ('slot_' + p.slot),
        slot: p.slot,
        isHost: false,
        isLocal: false,
        peerId: p.peerId,
        name: p.name,
        hero: p.hero,
        heroId: p.heroId,
        color: p.color,
        weapon: p.currentWeapon,
        currentWeapon: p.currentWeapon,
        x: p.x,
        y: p.y,
        angle: p.angle,
        hp: p.hp,
        maxHp: p.maxHp,
        shield: p.shield,
        maxShield: p.maxShield,
        isDowned: p.isDowned,
        downedTimer: p.downedTimer,
        reviveProgress: p.reviveProgress,
        shooting: false,
        walkTimer: 0,
        isHuman: true
      });
    });
  }

  buildSquadMembersListFromRoster(roster) {
    this.squadMembers = [];
    this.teammate = null; // No AI bot

    roster.forEach((p) => {
      if (p.slot !== this.mySlot) {
        const hero = HERO_DEFS[p.heroId] || HERO_DEFS.commando;
        const weap = WEAPON_DEFS[p.weaponId] || WEAPON_DEFS.ak47;
        const slotDef = SQUAD_SLOT_DEFS[p.slot - 1] || SQUAD_SLOT_DEFS[0];
        this.squadMembers.push({
          id: p.peerId || ('slot_' + p.slot),
          slot: p.slot,
          isHost: p.isHost,
          isLocal: false,
          peerId: p.peerId,
          name: p.name,
          hero: hero,
          heroId: p.heroId,
          color: slotDef.color,
          weapon: weap,
          currentWeapon: weap,
          x: WORLD_WIDTH / 2 + (p.slot === 2 ? 80 : p.slot === 3 ? -80 : 0),
          y: WORLD_HEIGHT / 2 + (p.slot === 4 ? 80 : -60),
          angle: 0,
          hp: hero.hp + 50,
          maxHp: hero.hp + 50,
          shield: hero.shield + 20,
          maxShield: hero.shield + 20,
          isDowned: false,
          downedTimer: 0,
          reviveProgress: 0,
          shooting: false,
          walkTimer: 0,
          isHuman: true
        });
      }
    });
  }

  launchSquadMatch() {
    if (this.squadPeers.size < 1) {
      this.showNotification('Wait for at least 1 teammate to join!', 'SQUAD REQUIRED', 'red');
      this.audio.playHit(false);
      return;
    }

    const roster = this.getSquadRosterSnapshot();
    const startPacket = {
      type: 'MATCH_START',
      roomCode: this.roomCode,
      squadRoster: roster
    };

    this.broadcastToSquad(startPacket);
    this.buildSquadMembersList();

    document.getElementById('squad-lobby-modal')?.classList.add('hidden');
    this.showNotification(`Squad Match Launched with ${this.squadMembers.length + 1} Operatives!`, 'MATCH COMMENCED', 'green');
    this.startRun();
  }

  // 30-60 Hz Client Input & Authoritative Host Broadcast Loop
  syncSquadNetworkState(dt) {
    if (!this.player) return;

    this.networkSyncTimer = (this.networkSyncTimer || 0) + dt;
    if (this.networkSyncTimer < 0.033) return; // ~30 Hz interval
    this.networkSyncTimer = 0;

    const localPlayerId = this.peer ? this.peer.id : (this.localPlayerId || (this.isHost ? 'host_p1' : ('p_' + this.mySlot)));
    this.localPlayerId = localPlayerId;
    this.player.isShooting = (this.mouse?.isDown || this.isTouchFiring) && !this.player.isDowned;

    // Realtime coordinate payload
    const payload = {
      type: 'PLAYER_UPDATE',
      id: localPlayerId,
      slot: this.mySlot || (this.isHost ? 1 : 2),
      name: this.saveData.playerName || (this.isHost ? 'Host Operative' : `Operative_P${this.mySlot}`),
      heroId: this.selectedHero || 'commando',
      x: this.player.x,
      y: this.player.y,
      angle: this.player.angle,
      shooting: Boolean(this.player.isShooting),
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      shield: this.player.shield,
      maxShield: this.player.maxShield,
      isDowned: Boolean(this.player.isDowned),
      downedTimer: this.player.downedTimer,
      weaponId: this.player.currentWeapon?.id
    };

    if (this.isHost) {
      // Host broadcasts local player state to all peers
      if (this.squadPeers) {
        this.squadPeers.forEach((p) => {
          if (p.conn && p.conn.open) {
            try { p.conn.send(payload); } catch (e) {}
          }
        });
      }
      if (this.localNetChannel) {
        try { this.localNetChannel.postMessage(payload); } catch (e) {}
      }

      // Host also broadcasts authoritative wave progression
      const hostSyncPacket = {
        type: 'HOST_SYNC',
        wave: this.wave,
        waveTimer: this.waveTimer
      };
      this.broadcastToSquad(hostSyncPacket);
      this.updateMultiplayerSquadHUD();
    } else {
      // Client transmits local player state to Host
      if (this.hostConn && this.hostConn.open) {
        try { this.hostConn.send(payload); } catch (e) {}
      }
      if (this.localNetChannel) {
        try { this.localNetChannel.postMessage(payload); } catch (e) {}
      }
      this.updateMultiplayerSquadHUD();
    }
  }

  applyHostSync(data) {
    if (!data) return;

    if (typeof data.wave === 'number') this.wave = data.wave;
    if (typeof data.waveTimer === 'number') this.waveTimer = data.waveTimer;

    if (data.squad && Array.isArray(data.squad)) {
      data.squad.forEach((state) => {
        if (state.slot === this.mySlot) {
          if (!state.isDowned && this.player.isDowned) {
            this.reviveLocalPlayer();
          }
        } else {
          const member = this.squadMembers.find(m => m.slot === state.slot || (state.peerId && m.peerId === state.peerId));
          if (member) {
            if (typeof state.x === 'number') member.x = state.x;
            if (typeof state.y === 'number') member.y = state.y;
            if (typeof state.angle === 'number') member.angle = state.angle;
            if (typeof state.hp === 'number') member.hp = state.hp;
            if (typeof state.shield === 'number') member.shield = state.shield;
            if (typeof state.isDowned === 'boolean') member.isDowned = state.isDowned;
          }
        }
      });
    }

    this.updateMultiplayerSquadHUD();
  }

  fireSquadPeerBullet(peer, angle) {
    if (!peer) return;
    const now = performance.now();
    const weap = peer.currentWeapon || peer.weapon || WEAPON_DEFS.ak47;
    const cooldownMs = 1000 / (weap.fireRate || 7);
    if (peer.lastFireTime && (now - peer.lastFireTime) < cooldownMs) {
      return;
    }
    peer.lastFireTime = now;

    const bulletSpeed = (weap.speed || 800) * 0.9;
    const bx = peer.x + Math.cos(angle) * 20;
    const by = peer.y + Math.sin(angle) * 20;

    this.projectiles.push({
      x: bx,
      y: by,
      vx: Math.cos(angle) * bulletSpeed,
      vy: Math.sin(angle) * bulletSpeed,
      damage: (weap.damage || 25) * 1.0,
      radius: 4,
      color: peer.color || '#00ff88',
      life: 1.2,
      pierce: weap.pierce || 1,
      isPlayerBullet: true
    });
    this.particles.addMuzzleFlash(bx, by, angle, peer.color || '#00ff88');
  }

  enterPlayerDownedState() {
    this.player.isDowned = true;
    this.player.downedTimer = 30;
    this.player.reviveProgress = 0;
    this.player.speed = this.player.hero.speed * 0.35; // crawl speed

    const downedBanner = document.getElementById('hud-downed-banner');
    if (downedBanner) downedBanner.classList.remove('hidden');

    this.particles.addShockwave(this.player.x, this.player.y, 100, '#ff0044', 0.4);
    this.particles.addCombatText(this.player.x, this.player.y - 50, 'OPERATIVE DOWNED!', '#ff0044', true);
    this.showNotification('OPERATIVE DOWNED! Squadmate must revive you within 30s!', 'SQUAD CRITICAL', 'red');

    this.updateMultiplayerSquadHUD();
  }

  reviveLocalPlayer() {
    this.player.isDowned = false;
    this.player.downedTimer = 0;
    this.player.reviveProgress = 0;
    this.player.hp = Math.round(this.player.maxHp * 0.45);
    this.player.shield = Math.round(this.player.maxShield * 0.5);
    this.player.invulnTime = 3.0;
    this.player.speed = this.player.hero.speed;

    document.getElementById('hud-downed-banner')?.classList.add('hidden');
    this.audio.playLevelUp();
    this.particles.addShockwave(this.player.x, this.player.y, 160, '#00ff88', 0.4);
    this.particles.addCombatText(this.player.x, this.player.y - 50, 'REVIVED! BACK IN FIGHT!', '#00ff88', true);
    this.showNotification('You have been revived by your squad!', 'REVIVED', 'green');
    this.updateHUD();
    this.updateMultiplayerSquadHUD();
  }

  // Revive tether mechanic across all connected real players
  handleSquadReviveTethers(dt) {
    if (!this.player || !this.squadMembers.length) return;

    // 1. If local player is downed: tick bleedout timer
    if (this.player.isDowned) {
      this.player.downedTimer -= dt;
      const timerEl = document.getElementById('hud-bleedout-timer');
      const fillEl = document.getElementById('hud-downed-fill');
      if (timerEl) timerEl.textContent = Math.max(0, Math.ceil(this.player.downedTimer));
      if (fillEl) fillEl.style.width = `${Math.max(0, (this.player.downedTimer / 30) * 100)}%`;

      if (this.player.downedTimer <= 0) {
        this.gameOver();
        return;
      }
    }

    // 2. Check revives on any downed squad members near local player
    this.squadMembers.forEach((member) => {
      if (member.isDowned) {
        member.downedTimer = Math.max(0, member.downedTimer - dt);
        const dist = Math.hypot(this.player.x - member.x, this.player.y - member.y);

        // If local player is alive and within 75px revive radius
        if (!this.player.isDowned && dist <= 75) {
          member.reviveProgress = Math.min(1.0, member.reviveProgress + dt * 0.35); // takes ~2.8s
          this.particles.addSpark(member.x + (Math.random() - 0.5) * 20, member.y + (Math.random() - 0.5) * 20, '#00ff88');

          if (member.reviveProgress >= 1.0) {
            member.isDowned = false;
            member.hp = Math.round(member.maxHp * 0.5);
            member.shield = Math.round(member.maxShield * 0.5);
            member.reviveProgress = 0;
            this.showNotification(`You revived ${member.name}!`, 'REVIVE COMPLETE', 'green');
            this.audio.playLevelUp();

            const revivePacket = { type: 'REVIVE_SUCCESS', slot: member.slot, peerId: member.peerId };
            if (this.isHost) {
              this.broadcastToSquad(revivePacket);
            } else if (this.hostConn && this.hostConn.open) {
              this.hostConn.send(revivePacket);
            }
          }
        } else {
          member.reviveProgress = Math.max(0, member.reviveProgress - dt * 0.2);
        }
      }
    });
  }

  updateMultiplayerSquadHUD() {
    if (!this.isPrivateMatch) return;
    const squadPanel = document.getElementById('hud-squad-panel');
    const squadList = document.getElementById('hud-squad-members-list');
    if (!squadPanel || !squadList) return;

    squadPanel.classList.remove('hidden');
    squadList.innerHTML = '';

    // Render cards for all other squad members (up to 3 teammates)
    this.squadMembers.forEach((m) => {
      const slotDef = SQUAD_SLOT_DEFS[m.slot - 1] || SQUAD_SLOT_DEFS[1];
      const card = document.createElement('div');
      card.className = `hud-squad-card p${m.slot}-card ${m.isDowned ? 'downed' : ''}`;

      const hpPct = Math.max(0, Math.min(100, (m.hp / m.maxHp) * 100));
      const shieldPct = Math.max(0, Math.min(100, (m.shield / m.maxShield) * 100));
      const statusText = m.isDowned
        ? `DOWNED (${Math.ceil(m.downedTimer)}s)`
        : m.reviveProgress > 0
          ? `REVIVING ${Math.round(m.reviveProgress * 100)}%`
          : 'ACTIVE';

      card.innerHTML = `
        <div class="hud-squad-avatar">${m.hero?.icon || '👤'}</div>
        <div class="hud-squad-info">
          <div class="hud-squad-name-row">
            <span class="hud-squad-name" style="color: ${slotDef.color};">[P${m.slot}] ${m.name}</span>
            <span class="hud-squad-badge" style="background: ${m.isDowned ? '#ff0044' : slotDef.color}; color: #020617;">${statusText}</span>
          </div>
          <div class="hud-squad-bars">
            <div class="tm-bar-track tm-hp-track" style="height: 4px; background: rgba(0,0,0,0.5); border-radius: 2px; overflow: hidden;">
              <div style="height: 100%; width: ${hpPct}%; background: ${m.isDowned ? '#ff0044' : '#00ff88'};"></div>
            </div>
            <div class="tm-bar-track tm-shield-track" style="height: 3px; background: rgba(0,0,0,0.5); border-radius: 2px; overflow: hidden; margin-top: 1px;">
              <div style="height: 100%; width: ${shieldPct}%; background: #00f0ff;"></div>
            </div>
          </div>
        </div>
      `;
      squadList.appendChild(card);
    });
  }

  drawSquadMembers() {
    if (!this.squadMembers || !this.squadMembers.length || !this.player || !this.ctx) return;
    const now = performance.now();
    this.squadMembers.forEach((m) => {
      this.drawSingleSquadMember(m, this.ctx, this.camera, now);
    });
  }

  drawSingleSquadMember(m, ctx, cam, now) {
    const tx = m.x - cam.x;
    const ty = m.y - cam.y;
    const slotDef = SQUAD_SLOT_DEFS[m.slot - 1] || SQUAD_SLOT_DEFS[1];
    const teamColor = slotDef.color;

    // 1. Off-Screen Direction Arrow & Distance
    const isOffScreen = (tx < 35 || tx > cam.width - 35 || ty < 35 || ty > cam.height - 35);
    if (isOffScreen) {
      const edgeX = Math.max(40, Math.min(cam.width - 40, tx));
      const edgeY = Math.max(40, Math.min(cam.height - 40, ty));
      const toAngle = Math.atan2(ty - cam.height / 2, tx - cam.width / 2);
      const distM = Math.round(Math.hypot(m.x - this.player.x, m.y - this.player.y) / 16);

      ctx.save();
      ctx.translate(edgeX, edgeY);
      ctx.rotate(toAngle);
      const arrowColor = m.isDowned ? '#ff0044' : teamColor;
      ctx.fillStyle = arrowColor;
      ctx.shadowColor = arrowColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(-8, -8);
      ctx.lineTo(-8, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.font = '700 10px "Share Tech Mono", monospace';
      ctx.fillStyle = arrowColor;
      ctx.textAlign = 'center';
      ctx.shadowColor = arrowColor;
      ctx.shadowBlur = 8;
      const tagText = m.isDowned ? `⚠️ [P${m.slot}] DOWNED [${distM}m]` : `P${m.slot} [${distM}m]`;
      ctx.fillText(tagText, edgeX, edgeY + (edgeY < cam.height / 2 ? 20 : -16));
      ctx.restore();
      return;
    }

    ctx.save();

    // 2. Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(tx, ty + 12, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Downed Pulse Ring & Revive Tether
    if (m.isDowned) {
      const pulseR = 32 + Math.sin(now * 0.008) * 8;
      ctx.strokeStyle = '#ff0044';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ff0044';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(tx, ty, pulseR, 0, Math.PI * 2);
      ctx.stroke();

      // Revive interaction radius
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(tx, ty, 75, 0, Math.PI * 2);
      ctx.stroke();

      // Revive progress arc
      if (m.reviveProgress > 0) {
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(tx, ty, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * m.reviveProgress);
        ctx.stroke();
      }

      // If local player is within revive range, draw glowing neon tether beam
      const distToPlayer = Math.hypot(this.player.x - m.x, this.player.y - m.y);
      if (distToPlayer <= 75 && !this.player.isDowned) {
        const px = this.player.x - cam.x;
        const py = this.player.y - cam.y;
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 10;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 4. Character Body & Weapon
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(m.angle);

    if (!m.isDowned) {
      // Legs
      const walk = m.walkTimer || 0;
      const legL = Math.sin(walk) * 6;
      const legR = -Math.sin(walk) * 6;
      ctx.fillStyle = '#101726';
      ctx.fillRect(-10 + legL, -13, 12, 6);
      ctx.fillRect(-10 + legR, 7, 12, 6);
      ctx.fillStyle = teamColor;
      ctx.fillRect(-6 + legL, -12, 3, 4);
      ctx.fillRect(-6 + legR, 8, 3, 4);

      // Torso
      ctx.fillStyle = '#141d2f';
      ctx.strokeStyle = teamColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(-2, 0, 11, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Weapon
      ctx.fillStyle = '#0f141f';
      ctx.fillRect(4, 2, 18, 5);
      ctx.fillStyle = '#222d3d';
      ctx.fillRect(18, 3, 14, 3);
      ctx.fillStyle = teamColor;
      ctx.fillRect(8, 4, 6, 8);

      // Helmet
      ctx.fillStyle = '#101624';
      ctx.beginPath();
      ctx.arc(-2, 0, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = teamColor;
      ctx.stroke();
      ctx.fillStyle = teamColor;
      ctx.fillRect(1, -5, 4, 10);
    } else {
      // Downed body
      ctx.fillStyle = '#161d2d';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff0044';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#ff0044';
      ctx.beginPath();
      ctx.arc(-2, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 5. Overhead Plate (P# Label, Name, Health)
    ctx.save();
    const plateY = ty - (m.isDowned ? 34 : 42);

    ctx.font = '800 10px "Rajdhani", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(10, 16, 28, 0.88)';
    ctx.strokeStyle = m.isDowned ? '#ff0044' : teamColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tx - 45, plateY - 10, 90, 16, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = m.isDowned ? '#ff3366' : '#ffffff';
    ctx.fillText(`[P${m.slot}] ${m.name}`, tx, plateY + 2);

    if (!m.isDowned) {
      const barW = 60;
      const barH = 4;
      const barX = tx - barW / 2;
      const barY = plateY + 8;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(barX, barY, barW, barH);
      const hpPct = Math.max(0, m.hp / m.maxHp);
      ctx.fillStyle = hpPct > 0.4 ? teamColor : '#ff0044';
      ctx.fillRect(barX, barY, barW * hpPct, barH);
    } else {
      ctx.font = '900 10px "Share Tech Mono", monospace';
      ctx.fillStyle = '#ff0044';
      ctx.fillText(`⚠️ DOWNED (${Math.ceil(m.downedTimer)}s)`, tx, plateY + 18);
    }

    ctx.restore();
    ctx.restore();
  }

  // ==========================================================================
  // HUD UPDATING
  // ==========================================================================
  updateHUD() {
    if (!this.player) return;

    // Health & Shield Bars
    const hpPct = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
    const shieldPct = Math.max(0, (this.player.shield / this.player.maxShield) * 100);
    const xpPct = Math.max(0, (this.player.xp / this.player.nextLevelXp) * 100);

    const hpFill = document.getElementById('hud-hp-fill');
    const shieldFill = document.getElementById('hud-shield-fill');
    const xpFill = document.getElementById('hud-xp-fill');

    if (hpFill) hpFill.style.width = `${hpPct}%`;
    if (shieldFill) shieldFill.style.width = `${shieldPct}%`;
    if (xpFill) xpFill.style.width = `${xpPct}%`;

    const hpVal = document.getElementById('hud-hp-val');
    const shieldVal = document.getElementById('hud-shield-val');
    const xpVal = document.getElementById('hud-xp-val');
    const lvlVal = document.getElementById('hud-level');

    if (hpVal) hpVal.textContent = `${Math.ceil(this.player.hp)}/${this.player.maxHp}`;
    if (shieldVal) shieldVal.textContent = `${Math.ceil(this.player.shield)}/${this.player.maxShield}`;
    if (xpVal) xpVal.textContent = `${this.player.xp}/${this.player.nextLevelXp}`;
    if (lvlVal) lvlVal.textContent = this.player.level;

    // Wave & Timer
    const waveVal = document.getElementById('hud-wave');
    const timerVal = document.getElementById('hud-timer');
    if (waveVal) waveVal.textContent = this.wave;
    if (timerVal) {
      const mins = Math.floor(this.runTime / 60);
      const secs = Math.floor(this.runTime % 60);
      timerVal.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Score & Credits
    const scoreVal = document.getElementById('hud-score');
    const credVal = document.getElementById('hud-credits');
    if (scoreVal) scoreVal.textContent = this.runScore.toString().padStart(6, '0');
    if (credVal) credVal.textContent = this.runCredits;

    // Combo UI
    const comboBox = document.getElementById('hud-combo-box');
    if (comboBox) {
      if (this.comboCount >= 3) {
        comboBox.classList.remove('hidden');
        document.getElementById('hud-combo-count').textContent = this.comboCount;
        const comboFill = document.getElementById('hud-combo-fill');
        if (comboFill) comboFill.style.width = `${(this.comboTimer / this.comboMaxTime) * 100}%`;
        const rating = document.getElementById('hud-combo-rating');
        if (rating) {
          if (this.comboCount >= 25) rating.textContent = '🔥 UNSTOPPABLE!';
          else if (this.comboCount >= 15) rating.textContent = '⚡ SAVAGE!';
          else if (this.comboCount >= 8) rating.textContent = '💥 RAMPAGE!';
          else rating.textContent = '⚔️ EXCELLENT!';
        }
      } else {
        comboBox.classList.add('hidden');
      }
    }

    // Cooldown overlays
    const dashCd = document.getElementById('skill-dash-cd');
    if (dashCd) dashCd.style.height = `${(this.player.dashCooldown / (this.player.dashMaxCd * this.player.cooldownMult)) * 100}%`;
    const specCd = document.getElementById('skill-special-cd');
    if (specCd) specCd.style.height = `${(this.player.specialCooldown / (this.player.specialMaxCd * this.player.cooldownMult)) * 100}%`;
    const ultCd = document.getElementById('skill-ult-cd');
    if (ultCd) ultCd.style.height = `${(this.player.ultCooldown / (this.player.ultMaxCd * this.player.cooldownMult)) * 100}%`;

    // Boss Bar
    if (this.activeBoss) {
      const bossPct = Math.max(0, (this.activeBoss.hp / this.activeBoss.maxHp) * 100);
      const bossFill = document.getElementById('boss-hp-fill');
      const bossPctEl = document.getElementById('boss-hp-pct');
      if (bossFill) bossFill.style.width = `${bossPct}%`;
      if (bossPctEl) bossPctEl.textContent = `${Math.ceil(bossPct)}%`;
    }
  }

  // ==========================================================================
  // HIGH-DEFINITION GRAPHICS & CANVAS RENDERING
  // ==========================================================================
  renderFallbackFrame() {
    if (!this.ctx || !this.canvas) return;
    const w = this.camera.width || window.innerWidth || 1280;
    const h = this.camera.height || window.innerHeight || 720;

    // Fallback render call: clear canvas with deep cyber dark background
    this.ctx.fillStyle = '#0a0d14';
    this.ctx.fillRect(0, 0, w, h);

    if (this.player) {
      this.camera.x = this.player.x - w / 2;
      this.camera.y = this.player.y - h / 2;
    }

    try {
      this.drawArena();
    } catch (e) {
      console.warn('drawArena fallback notice:', e);
    }

    if (this.player) {
      try {
        this.drawPlayer();
      } catch (e) {
        console.warn('drawPlayer fallback notice:', e);
      }
    }

    if (this.isPrivateMatch) {
      try {
        this.drawSquadMembers();
      } catch (e) {
        console.warn('drawSquadMembers fallback notice:', e);
      }
    }
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.camera.width, this.camera.height);

    if (this.state === 'MENU') {
      this.drawMenuBackground();
      this.renderHeroStageCanvas();
      return;
    }

    // Always clear canvas with solid high-tech dark background
    this.ctx.fillStyle = '#0a0d14';
    this.ctx.fillRect(0, 0, this.camera.width, this.camera.height);

    // 1. Draw High-Tech Floor, Scorch Marks & Hazard Borders
    try {
      this.drawArena();
    } catch (err) {
      console.warn('drawArena render error:', err);
    }

    // 2. Draw Ground Hazards & AoE Fields
    try {
      this.drawHazards();
    } catch (err) {
      console.warn('drawHazards render error:', err);
    }

    // 3. Draw 3D Faceted Pickups & Nanites
    try {
      this.drawPickups();
    } catch (err) {
      console.warn('drawPickups render error:', err);
    }

    // 4. Draw Glowing Plasma Projectiles & Beams
    try {
      this.drawProjectiles();
    } catch (err) {
      console.warn('drawProjectiles render error:', err);
    }

    // 5. Draw Procedural Cyborg Enemies, Mechs & Bosses
    try {
      this.drawEnemies();
    } catch (err) {
      console.warn('drawEnemies render error:', err);
    }

    // 6. Draw High-Def Soldier Operative ("MAN & GUN"), Flashlight & Drones
    try {
      this.drawPlayer();
    } catch (err) {
      console.warn('drawPlayer render error:', err);
    }

    // 6b. Draw 4-Player Co-Op Squad Members
    if (this.isPrivateMatch) {
      try {
        this.drawSquadMembers();
      } catch (err) {
        console.warn('drawSquadMembers render error:', err);
      }
    }

    // 7. Draw Next-Gen Particles, Shell Casings & Combat Text
    try {
      this.particles.draw(this.ctx, this.camera);
    } catch (err) {
      console.warn('particles render error:', err);
    }

    // 8. Draw Atmospheric Vignette & Dynamic Lighting
    try {
      this.drawAtmosphereAndLighting();
    } catch (err) {
      console.warn('drawAtmosphere render error:', err);
    }

    // 9. Draw Off-screen Threat Compass
    try {
      this.drawThreatIndicators();
    } catch (err) {
      console.warn('drawThreatIndicators render error:', err);
    }

    // 10. Draw Custom Sci-Fi Aim Crosshair (when in-game)
    try {
      this.drawCrosshair();
    } catch (err) {
      console.warn('drawCrosshair render error:', err);
    }
  }

  drawArena() {
    const ctx = this.ctx;
    const cam = this.camera;
    const now = performance.now();
    const arenaBorderColor = '#00f0ff';
    const accentColor = '#ff007f';

    ctx.save();

    // High-Tech Metallic Panel Floor Tiles
    const tileSize = 100;
    const startX = Math.floor(cam.x / tileSize) * tileSize;
    const startY = Math.floor(cam.y / tileSize) * tileSize;

    for (let x = startX; x < cam.x + cam.width + tileSize; x += tileSize) {
      for (let y = startY; y < cam.y + cam.height + tileSize; y += tileSize) {
        const tx = x - cam.x;
        const ty = y - cam.y;

        // Beveled Sci-Fi Floor Plate
        const tileHash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
        ctx.fillStyle = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0 ? '#0b0f1e' : '#080c18';
        ctx.fillRect(tx, ty, tileSize, tileSize);

        // Panel Border Seams
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx + 1, ty + 1, tileSize - 2, tileSize - 2);

        // Micro-LED Circuit Junctions on select tiles
        if (tileHash % 5 < 1) {
          ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
          ctx.fillRect(tx + 10, ty + 10, 8, 8);
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(tx + 13, ty + 13, 2, 2);
        }

        // Floor Ventilation Grates on select tiles
        if (tileHash % 9 < 1) {
          ctx.fillStyle = '#05070f';
          ctx.fillRect(tx + 30, ty + 30, 40, 40);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1;
          for (let gy = ty + 34; gy < ty + 68; gy += 6) {
            ctx.beginPath();
            ctx.moveTo(tx + 34, gy);
            ctx.lineTo(tx + 66, gy);
            ctx.stroke();
          }
        }
      }
    }

    // Draw Persistent Ground Scorch Marks & Blast Craters
    this.particles.drawScorchMarks(ctx, cam);

    // ====================================================
    // ARENA PERIMETER HAZARD BORDERS & FORCEFIELD WALLS
    // ====================================================
    const arenaX = 0 - cam.x;
    const arenaY = 0 - cam.y;
    const arenaW = WORLD_WIDTH;
    const arenaH = WORLD_HEIGHT;

    // Diagonal Yellow/Black Hazard Chevrons along Perimeter
    ctx.save();
    ctx.lineWidth = 16;
    ctx.strokeStyle = '#101422';
    ctx.strokeRect(arenaX + 8, arenaY + 8, arenaW - 16, arenaH - 16);

    // Hazard Stripes
    const stripeW = 24;
    const pulseOffset = (now * 0.04) % (stripeW * 2);

    // Glowing Neon Forcefield Boundary
    ctx.strokeStyle = arenaBorderColor;
    ctx.lineWidth = 4;
    ctx.shadowColor = arenaBorderColor;
    ctx.shadowBlur = 22;
    ctx.strokeRect(arenaX, arenaY, arenaW, arenaH);

    // Secondary Inner High-Voltage Plasma Rail
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 10;
    ctx.strokeRect(arenaX + 16, arenaY + 16, arenaW - 32, arenaH - 32);

    // 4 Heavy Corner Power Forcefield Pylons
    const corners = [
      { x: arenaX, y: arenaY },
      { x: arenaX + arenaW, y: arenaY },
      { x: arenaX, y: arenaY + arenaH },
      { x: arenaX + arenaW, y: arenaY + arenaH }
    ];

    corners.forEach((c) => {
      ctx.fillStyle = '#10172c';
      ctx.strokeStyle = arenaBorderColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pulsing Pylon Reactor Core
      ctx.fillStyle = arenaBorderColor;
      ctx.shadowColor = arenaBorderColor;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 8 + Math.sin(now * 0.006) * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
    ctx.restore();
  }

  drawHazards() {
    const ctx = this.ctx;
    const cam = this.camera;
    const now = performance.now();

    this.hazards.forEach((h) => {
      const hx = h.x - cam.x;
      const hy = h.y - cam.y;

      ctx.save();
      // Glowing AoE Shock Field
      const grad = ctx.createRadialGradient(hx, hy, h.radius * 0.2, hx, hy, h.radius);
      grad.addColorStop(0, h.color);
      grad.addColorStop(0.8, h.color);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.arc(hx, hy, h.radius, 0, Math.PI * 2);
      ctx.fill();

      // Rotating Rune Energy Rings
      ctx.strokeStyle = h.color;
      ctx.shadowColor = h.color;
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(hx, hy, h.radius * (0.85 + Math.sin(now * 0.008) * 0.1), 0, Math.PI * 2);
      ctx.stroke();

      // Outer Energy Pulses
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = now * 0.05;
      ctx.beginPath();
      ctx.arc(hx, hy, h.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });
  }

  drawPickups() {
    const ctx = this.ctx;
    const cam = this.camera;
    const now = performance.now();

    this.pickups.forEach((p) => {
      const px = p.x - cam.x;
      const py = p.y - cam.y;
      if (px < -60 || px > cam.width + 60 || py < -60 || py > cam.height + 60) return;

      ctx.save();
      const bob = Math.sin(now * 0.006 + p.x) * 4;

      if (p.type === 'xp') {
        // 3D Faceted Diamond XP Gem
        ctx.translate(px, py + bob);
        ctx.rotate(now * 0.003);

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;

        // Diamond Facets
        ctx.beginPath();
        ctx.moveTo(0, -p.radius * 1.3);
        ctx.lineTo(p.radius * 1.1, 0);
        ctx.lineTo(0, p.radius * 1.3);
        ctx.lineTo(-p.radius * 1.1, 0);
        ctx.closePath();
        ctx.fill();

        // Inner Specular Glint Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -p.radius * 0.7);
        ctx.lineTo(p.radius * 0.5, 0);
        ctx.lineTo(0, p.radius * 0.7);
        ctx.lineTo(-p.radius * 0.5, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'heal') {
        // Medical Nanite Flask with Glowing Green Cross
        ctx.translate(px, py + bob);
        ctx.fillStyle = '#0a1e14';
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glowing Medical Cross
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(-3, -8, 6, 16);
        ctx.fillRect(-8, -3, 16, 6);
      } else if (p.type === 'magnet') {
        // High-Voltage Magnetic Flux Ring
        ctx.translate(px, py + bob);
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 1.2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffaa00';
        ctx.font = '700 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧲', 0, 0);
      } else {
        // Nuclear Detonator Warhead
        ctx.translate(px, py + bob);
        ctx.fillStyle = '#ff2a2a';
        ctx.shadowColor = '#ff2a2a';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 1.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 12px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☢️', 0, 0);
      }

      ctx.restore();
    });
  }

  drawProjectiles() {
    const ctx = this.ctx;
    const cam = this.camera;

    // Friendly Projectiles with Glowing Laser Tails
    this.projectiles.forEach((p) => {
      const px = p.x - cam.x;
      const py = p.y - cam.y;
      if (px < -40 || px > cam.width + 40 || py < -40 || py > cam.height + 40) return;

      const color = p.color;
      const angle = Math.atan2(p.vy, p.vx);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);

      // Outer Glow Aura
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;

      // Elongated High-Speed Plasma Capsule
      ctx.beginPath();
      ctx.roundRect(-p.radius * 2.2, -p.radius * 0.7, p.radius * 3.4, p.radius * 1.4, p.radius * 0.7);
      ctx.fill();

      // White Hyper-Dense Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-p.radius * 1.4, -p.radius * 0.35, p.radius * 2.4, p.radius * 0.7, p.radius * 0.35);
      ctx.fill();

      ctx.restore();
    });

    // Enemy Projectiles with Crimson Plasma Glow
    this.enemyProjectiles.forEach((ep) => {
      const epx = ep.x - cam.x;
      const epy = ep.y - cam.y;
      if (epx < -40 || epx > cam.width + 40 || epy < -40 || epy > cam.height + 40) return;

      const angle = Math.atan2(ep.vy, ep.vx);

      ctx.save();
      ctx.translate(epx, epy);
      ctx.rotate(angle);

      ctx.fillStyle = ep.color;
      ctx.shadowColor = ep.color;
      ctx.shadowBlur = 18;

      ctx.beginPath();
      ctx.roundRect(-ep.radius * 2, -ep.radius * 0.8, ep.radius * 3, ep.radius * 1.6, ep.radius * 0.8);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ep.radius * 0.3, 0, ep.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  drawEnemies() {
    const ctx = this.ctx;
    const cam = this.camera;
    const now = performance.now();

    this.enemies.forEach((e) => {
      const ex = e.x - cam.x;
      const ey = e.y - cam.y;
      if (ex < -120 || ex > cam.width + 120 || ey < -120 || ey > cam.height + 120) return;

      // Telegraph aiming line for snipers
      if (e.type === 'sniper' && e.shootTimer < 1.0 && this.player) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 0, 85, ${0.4 + Math.sin(now * 0.02) * 0.35})`;
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 8;
        ctx.setLineDash([8, 6]);
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(this.player.x - cam.x, this.player.y - cam.y);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();

      // Enemy Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(ex, ey + e.radius * 0.4, e.radius * 1.1, e.radius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Facing Angle toward player
      const eAngle = this.player ? Math.atan2(this.player.y - e.y, this.player.x - e.x) : 0;
      ctx.translate(ex, ey);
      ctx.rotate(eAngle);

      if (e.isBoss) {
        // ==========================================
        // TITAN DREADNOUGHT BOSS (HIGH-DEF WAR MECH)
        // ==========================================
        // Armored Hull Plates
        ctx.fillStyle = '#140c1e';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Heavy Quad Gatling Turret Pods
        ctx.fillStyle = '#445566';
        ctx.fillRect(e.radius - 6, -20, 26, 7);
        ctx.fillRect(e.radius - 6, 13, 26, 7);
        ctx.fillRect(e.radius - 12, -32, 20, 6);
        ctx.fillRect(e.radius - 12, 26, 20, 6);

        // Core Singularity Plasma Reactor
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(0, 0, 18 + Math.sin(now * 0.008) * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'goliath') {
        // ==========================================
        // GOLIATH SIEGE MECH (ARTICULATED 2-LEG MECH)
        // ==========================================
        // Heavy Armored Torso Chassis
        ctx.fillStyle = '#182030';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(-e.radius * 0.85, -e.radius * 0.85, e.radius * 1.7, e.radius * 1.7, 6);
        ctx.fill();
        ctx.stroke();

        // Twin Heavy Shoulder Gatling Barrels
        ctx.fillStyle = '#3a4a66';
        ctx.fillRect(e.radius * 0.1, -e.radius * 0.8, 20, 6);
        ctx.fillRect(e.radius * 0.1, e.radius * 0.8 - 6, 20, 6);

        // Hazard Warning Stripes on Shoulders
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(-e.radius * 0.7, -e.radius * 0.8, 6, 6);
        ctx.fillRect(-e.radius * 0.7, e.radius * 0.8 - 6, 6, 6);

        // Glowing Mechanical Core
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'sniper') {
        // ==========================================
        // CYBORG SNIPER OPERATIVE
        // ==========================================
        ctx.fillStyle = '#121728';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Long Railgun Precision Barrel
        ctx.fillStyle = '#22304d';
        ctx.fillRect(2, -2.5, 28, 5);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(28, -2, 4, 4); // Scope lens glare
      } else if (e.type === 'kamikaze') {
        // ==========================================
        // TRI-WING DIVE DRONE
        // ==========================================
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-12, -14);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-12, 14);
        ctx.closePath();
        ctx.fill();

        // Pulsing Overload Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(2, 0, 4 + Math.sin(now * 0.02) * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'stalker') {
        // ==========================================
        // CYBER STALKER (DUAL PLASMA BLADES)
        // ==========================================
        ctx.fillStyle = '#1a1024';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Twin Forward Plasma Blades
        ctx.strokeStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(4, -10);
        ctx.lineTo(20, -6);
        ctx.moveTo(4, 10);
        ctx.lineTo(20, 6);
        ctx.stroke();
      } else {
        // ==========================================
        // SCRAPPER COMBAT DRONE (4 WALKING LEGS)
        // ==========================================
        // 4 Articulated Crab Legs
        const legWalk = Math.sin(now * 0.015 + e.x) * 6;
        ctx.strokeStyle = '#2e3d55';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(0, -6); ctx.lineTo(10 + legWalk, -16);
        ctx.moveTo(0, 6); ctx.lineTo(10 - legWalk, 16);
        ctx.moveTo(-6, -6); ctx.lineTo(-14 - legWalk, -14);
        ctx.moveTo(-6, 6); ctx.lineTo(-14 + legWalk, 14);
        ctx.stroke();

        // Body Shell
        ctx.fillStyle = '#141a29';
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Sweeping Optical Sensor Eye
        ctx.fillStyle = e.color;
        ctx.fillRect(2, -4, 4, 8);
      }

      ctx.restore();

      // High-Contrast Enemy Health Gauge
      if (e.hp < e.maxHp) {
        const barW = e.radius * 2.2;
        const barH = 4;
        const hpPct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(ex - barW / 2, ey - e.radius - 12, barW, barH);
        ctx.fillStyle = e.isBoss ? '#ffaa00' : '#ff2a2a';
        ctx.fillRect(ex - barW / 2, ey - e.radius - 12, barW * hpPct, barH);
      }
    });
  }

  drawPlayer() {
    if (!this.player) return;
    const ctx = this.ctx;
    const cam = this.camera;
    const px = this.player.x - cam.x;
    const py = this.player.y - cam.y;
    const now = performance.now();
    const heroColor = this.player.hero.color;
    const shieldColor = '#00f0ff';
    const heroId = this.player.hero.id;
    const walk = this.player.walkCycle || 0;
    const recoil = this.player.recoil || 0;

    ctx.save();

    // ==========================================
    // 1. TACTICAL FLASHLIGHT CONE (DYNAMIC LIGHT)
    // ==========================================
    ctx.save();
    const flashAngle = this.player.angle;
    const lightDist = 380;
    const lightSpread = 0.42;

    const flashGrad = ctx.createRadialGradient(px, py, 20, px + Math.cos(flashAngle) * lightDist, py + Math.sin(flashAngle) * lightDist, lightDist);
    flashGrad.addColorStop(0, 'rgba(0, 240, 255, 0.18)');
    flashGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.08)');
    flashGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, lightDist, flashAngle - lightSpread, flashAngle + lightSpread);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // ==========================================
    // 2. SOFT REAL-TIME CHARACTER DROP SHADOW
    // ==========================================
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(px - Math.cos(this.player.angle) * 4, py + 14, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Invulnerability Blink
    if (this.player.invulnTime > 0 && Math.floor(now / 60) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Downed Warning Aura & Beacon
    if (this.player.isDowned) {
      ctx.save();
      const pulseR = 30 + Math.sin(now * 0.008) * 6;
      ctx.strokeStyle = '#ff0044';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ff0044';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(px, py, pulseR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 255, 136, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, 75, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = '900 11px "Share Tech Mono", monospace';
      ctx.fillStyle = '#ff0044';
      ctx.textAlign = 'center';
      ctx.fillText(`⚠️ DOWNED (${Math.ceil(this.player.downedTimer)}s)`, px, py - 36);
      ctx.restore();
    }

    // Transform to Player Position & Aim Angle
    ctx.translate(px, py);
    ctx.rotate(this.player.angle);

    if (this.player.isDowned) {
      ctx.fillStyle = '#161d2d';
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff0044';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.fillStyle = '#ff0044';
      ctx.beginPath();
      ctx.arc(-2, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return;
    }

    // ==========================================
    // 3. ANIMATED BOOTS & LEGS (WALK CYCLE)
    // ==========================================
    const legOffsetL = Math.sin(walk) * 9;
    const legOffsetR = -Math.sin(walk) * 9;

    // Left Boot
    ctx.fillStyle = '#141c2c';
    ctx.beginPath();
    ctx.roundRect(-10 + legOffsetL, -14, 13, 7, 3);
    ctx.fill();
    ctx.fillStyle = heroColor;
    ctx.fillRect(-6 + legOffsetL, -13, 3, 5);

    // Right Boot
    ctx.fillStyle = '#141c2c';
    ctx.beginPath();
    ctx.roundRect(-10 + legOffsetR, 7, 13, 7, 3);
    ctx.fill();
    ctx.fillStyle = heroColor;
    ctx.fillRect(-6 + legOffsetR, 8, 3, 5);

    // ==========================================
    // 4. TORSO / TACTICAL CAMO VEST / HARNESS
    // ==========================================
    // Back Armor Rig & Utility Pack
    ctx.fillStyle = '#101626';
    ctx.beginPath();
    ctx.roundRect(-14, -12, 10, 24, 4);
    ctx.fill();

    // Main Torso Vest
    ctx.fillStyle = '#1c263d';
    ctx.strokeStyle = heroColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(-2, 0, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing Chest Cyber-Core Insignia
    ctx.fillStyle = heroColor;
    ctx.shadowColor = heroColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Left & Right Shoulder Armor Pauldrons
    ctx.fillStyle = '#263452';
    ctx.strokeStyle = heroColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-4, -16, 9, 7, 3);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(-4, 9, 9, 7, 3);
    ctx.fill();
    ctx.stroke();

    // ==========================================
    // 5. WEAPON ("GUN") & ARMS HOLDING THE WEAPON
    // ==========================================
    ctx.save();
    ctx.translate(-recoil, 0);

    if (heroId === 'ninja') {
      // SHADOW NINJA: High-Frequency Energy Katana
      ctx.fillStyle = '#1c263d';
      ctx.beginPath();
      ctx.arc(6, 2, 4.2, 0, Math.PI * 2);
      ctx.arc(10, 2, 4.2, 0, Math.PI * 2);
      ctx.fill();

      // Katana Hilt & Guard
      ctx.fillStyle = '#080c14';
      ctx.fillRect(4, 1, 10, 2.5);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(14, -2, 2.5, 8);

      // Glowing Neon Katana Blade with Lightning Core
      ctx.strokeStyle = heroColor;
      ctx.shadowColor = heroColor;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(16, 2);
      ctx.lineTo(46, 2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(17, 2);
      ctx.lineTo(45, 2);
      ctx.stroke();
    } else if (heroId === 'juggernaut') {
      // HEAVY JUGGERNAUT: Rotary Triple-Barrel Flak Shotgun Cannon
      ctx.fillStyle = '#161e30';
      ctx.fillRect(-2, 4, 14, 6);
      ctx.fillRect(0, -6, 12, 5);

      // Flak Gun Body & Ammo Drum
      ctx.fillStyle = '#0d121c';
      ctx.fillRect(8, 2, 18, 9);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(12, 10, 8, 5);
      ctx.fillStyle = '#4a5b73';
      ctx.fillRect(26, 3, 10, 7);

      // Triple Barrel Block
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(36, 4, 4, 2);
      ctx.fillRect(36, 7, 4, 2);

      // Gauntlets
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(12, 4, 4, 0, Math.PI * 2);
      ctx.arc(20, 3, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (heroId === 'psionic') {
      // VOID PSIONIC: Dual Astral Gauntlets & Swirling Core
      ctx.fillStyle = '#1c263d';
      ctx.beginPath();
      ctx.arc(14, -6, 4.5, 0, Math.PI * 2);
      ctx.arc(14, 6, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Swirling Void Dark Matter Singularity
      ctx.fillStyle = heroColor;
      ctx.shadowColor = heroColor;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      const pulseR = 6 + Math.sin(now * 0.01) * 2;
      ctx.arc(24, 0, pulseR, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // TACTICAL FIREARM WITH EQUIPPED GUN SKIN
      const curWeap = this.player.currentWeapon || WEAPON_DEFS[this.saveData.primaryWeapon] || WEAPON_DEFS.ak47;
      const eqSkinId = this.saveData.equippedSkins?.[curWeap?.id] || 'default';
      const skinObj = WEAPON_SKINS[curWeap?.id]?.[eqSkinId] || WEAPON_SKINS[curWeap?.id]?.default;
      const sColors = skinObj?.colors || {};
      const skinBody = sColors.body || '#0d121c';
      const skinBarrel = sColors.barrel || '#222e44';
      const skinGlow = sColors.glow || sColors.bulletColor || heroColor;
      const skinAccent = sColors.wood || sColors.handguard || sColors.mag || skinGlow;

      ctx.fillStyle = '#182033';
      // Left arm on foregrip
      ctx.beginPath();
      ctx.moveTo(-1, -10);
      ctx.lineTo(16, -1);
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#182033';
      ctx.stroke();

      // Right arm on trigger
      ctx.beginPath();
      ctx.moveTo(-1, 8);
      ctx.lineTo(8, 4);
      ctx.lineWidth = 5;
      ctx.stroke();

      // Rifle Receiver Frame with Skin Color
      ctx.fillStyle = skinBody;
      ctx.fillRect(4, 2, 14, 5);

      // Extended Heavy Plasma Barrel with Skin Barrel Color
      ctx.fillStyle = skinBarrel;
      ctx.fillRect(18, 3, 16, 3);
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(34, 2.5, 3.5, 4);

      // Custom Skin Accent / Magazine
      ctx.fillStyle = skinAccent;
      ctx.fillRect(8, 2.5, 4, 4);

      // Glowing Plasma Magazine Cell
      ctx.fillStyle = skinGlow;
      ctx.shadowColor = skinGlow;
      ctx.shadowBlur = 8;
      ctx.fillRect(10, 6, 4, 5);
      ctx.shadowBlur = 0;

      // Holographic Sight Optic with Skin Glow
      ctx.fillStyle = skinGlow;
      ctx.fillRect(11, 0, 4, 2);

      // Hands
      ctx.fillStyle = '#2a3959';
      ctx.beginPath();
      ctx.arc(8, 4, 3.2, 0, Math.PI * 2);
      ctx.arc(18, 2, 3.2, 0, Math.PI * 2);
      ctx.fill();

      // Tactical Laser Sight Targeting Beam with Skin Glow Color
      ctx.save();
      ctx.strokeStyle = skinGlow;
      ctx.globalAlpha = 0.45;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(37, 4);
      ctx.lineTo(260, 4);
      ctx.stroke();
      ctx.restore();
    }

    // ==========================================
    // 6. DYNAMIC MUZZLE FLASH STARBURST
    // ==========================================
    if (this.player.muzzleFlash > 0) {
      const flashX = heroId === 'ninja' ? 46 : (heroId === 'juggernaut' ? 39 : 37);
      const flashY = heroId === 'ninja' ? 2 : (heroId === 'juggernaut' ? 5 : 4);
      const curWeap = this.player.currentWeapon || WEAPON_DEFS[this.saveData.primaryWeapon] || WEAPON_DEFS.ak47;
      const eqSkinId = this.saveData.equippedSkins?.[curWeap?.id] || 'default';
      const skinFlashColor = WEAPON_SKINS[curWeap?.id]?.[eqSkinId]?.colors?.glow || heroColor;

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = skinFlashColor;
      ctx.shadowBlur = 24;

      // 4-point Starburst
      ctx.beginPath();
      ctx.moveTo(flashX + 16, flashY);
      ctx.lineTo(flashX + 4, flashY - 4);
      ctx.lineTo(flashX, flashY - 16);
      ctx.lineTo(flashX - 4, flashY - 4);
      ctx.lineTo(flashX - 16, flashY);
      ctx.lineTo(flashX - 4, flashY + 4);
      ctx.lineTo(flashX, flashY + 16);
      ctx.lineTo(flashX + 4, flashY + 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = skinFlashColor;
      ctx.beginPath();
      ctx.arc(flashX, flashY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore(); // end gun recoil

    // ==========================================
    // 7. HEAD & COMBAT HELMET / VISOR
    // ==========================================
    ctx.fillStyle = '#141c2c';
    ctx.strokeStyle = '#263452';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-2, 0, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Specular Visor with animated glare
    ctx.fillStyle = heroColor;
    ctx.shadowColor = heroColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(1, -5.5, 4.5, 11, 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Moving Visor Specular Sheen
    const sheenY = -4 + ((now * 0.005) % 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, sheenY, 3, 2);

    // Radio Antenna LED
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(-6, -12, 2, 2);

    // ==========================================
    // 8. ENERGY SHIELD BUBBLE
    // ==========================================
    if (this.player.shield > 0) {
      ctx.strokeStyle = shieldColor;
      ctx.shadowColor = shieldColor;
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(-2, 0, 26, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore(); // end player transform

    // 9. Companion Combat Drone
    if (this.player.drones > 0) {
      const droneColor = '#00f0ff';
      const ddx = px + Math.cos(this.droneAngle) * 52;
      const ddy = py + Math.sin(this.droneAngle) * 52;

      ctx.save();
      ctx.fillStyle = '#101626';
      ctx.strokeStyle = droneColor;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = droneColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ddx, ddy, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = droneColor;
      ctx.beginPath();
      ctx.arc(ddx, ddy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawAtmosphereAndLighting() {
    const ctx = this.ctx;
    const w = this.camera.width;
    const h = this.camera.height;

    // Cinematic Dark Vignette around Screen Edges
    ctx.save();
    const vigGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.4, w / 2, h / 2, Math.max(w, h) * 0.75);
    vigGrad.addColorStop(0, 'transparent');
    vigGrad.addColorStop(1, 'rgba(3, 5, 12, 0.65)');

    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  drawThreatIndicators() {
    const ctx = this.ctx;
    const cam = this.camera;

    // Draw warning chevrons for off-screen bosses or heavy threats
    if (this.activeBoss) {
      const bx = this.activeBoss.x - cam.x;
      const by = this.activeBoss.y - cam.y;
      if (bx < 0 || bx > cam.width || by < 0 || by > cam.height) {
        const edgeX = Math.max(30, Math.min(cam.width - 30, bx));
        const edgeY = Math.max(30, Math.min(cam.height - 30, by));
        const angle = Math.atan2(by - cam.height / 2, bx - cam.width / 2);

        ctx.save();
        ctx.translate(edgeX, edgeY);
        ctx.rotate(angle);
        ctx.fillStyle = '#ff0033';
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-10, -10);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }

  drawCrosshair() {
    if (this.state !== 'PLAYING') return;
    const ctx = this.ctx;
    const mx = this.mouse.x;
    const my = this.mouse.y;
    const heroColor = this.player?.hero?.color || '#00f0ff';
    const recoil = (this.player?.recoil || 0) * 1.6;

    ctx.save();
    ctx.translate(mx, my);

    // Pinpoint Center Dot
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = heroColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 4 Corner Reticle Crosshair Ticks
    const spread = 12 + recoil;
    const tickLen = 6;
    ctx.strokeStyle = heroColor;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = heroColor;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    // Top
    ctx.moveTo(0, -spread);
    ctx.lineTo(0, -spread - tickLen);
    // Bottom
    ctx.moveTo(0, spread);
    ctx.lineTo(0, spread + tickLen);
    // Left
    ctx.moveTo(-spread, 0);
    ctx.lineTo(-spread - tickLen, 0);
    // Right
    ctx.moveTo(spread, 0);
    ctx.lineTo(spread + tickLen, 0);
    ctx.stroke();

    // Subtle Outer Target Ring
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, spread + 3, 0, Math.PI * 2);
    ctx.stroke();

    // In-Game Reticle Reload Progress Ring & Ammo Counter
    if (this.player) {
      const curWeap = this.player.currentWeapon || WEAPON_DEFS[this.saveData.primaryWeapon] || WEAPON_DEFS.ak47;
      const curAmmo = (this.player.ammo && this.player.ammo[curWeap.id] !== undefined) ? this.player.ammo[curWeap.id] : curWeap.magSize;

      if (this.player.isReloading && this.player.reloadDuration > 0) {
        const pct = Math.max(0, Math.min(1, 1 - (this.player.reloadTimer / this.player.reloadDuration)));
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, spread + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
        ctx.stroke();

        ctx.font = '900 10px "Rajdhani", sans-serif';
        ctx.fillStyle = '#ffaa00';
        ctx.textAlign = 'center';
        ctx.fillText('RELOADING...', 0, spread + 22);
      } else {
        ctx.font = '800 10px "Share Tech Mono", monospace';
        const isLow = curAmmo <= Math.max(1, Math.floor(curWeap.magSize * 0.25));
        ctx.fillStyle = isLow ? '#ff3344' : 'rgba(255, 255, 255, 0.85)';
        if (isLow) {
          ctx.shadowColor = '#ff3344';
          ctx.shadowBlur = 8;
        }
        ctx.textAlign = 'center';
        ctx.fillText(`${curAmmo}/${curWeap.magSize}`, 0, spread + 18);
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }

  drawMenuBackground() {
    const ctx = this.ctx;
    ctx.fillStyle = '#070913';
    ctx.fillRect(0, 0, this.camera.width, this.camera.height);
  }
}

// ============================================================================
// INITIALIZATION ON DOM READY (ENCAPSULATED IIFE CLOSURE)
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
  // Game instance and all core variables (diamonds, coins, score, stats)
  // are scoped safely within this closure and cannot be modified via window.
  const gameInstance = new Game();
});

})();
