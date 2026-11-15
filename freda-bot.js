/*
 * Freda Bot : la petite mascotte de Freda Pay Issuing (tableau de bord marchand et panneau admin).
 * Une boule blanche avec une visière noire bordée d'un dégradé violet / bleu / cyan et deux yeux lumineux.
 * Elle regarde la souris, cligne des yeux, change d'humeur (contente, fâchée avec les sourcils froncés, curieuse, surprise,
 * endormie), vient voir de près ce que fait l'utilisateur, puis retourne à sa place. Aucune dépendance.
 *
 * Il s'appelle Bali. À la première visite il vient se présenter et montre les endroits importants de la page.
 * Réglages facultatifs, AVANT ce script :  window.FREDA_BOT = { lang: 'fr' | 'ht' | 'en', context: 'dashboard' | 'landing' | 'admin', onClick: function () {}, size: 72, name: 'Bali', intro: true }
 */
(function () {
  'use strict';
  if (window.__fredaBotLoaded) return;
  window.__fredaBotLoaded = true;

  var cfg = Object.assign({ lang: 'fr', size: 72, onClick: null, name: 'Bali', context: 'dashboard', intro: true, introKey: 'freda_bot_intro_v1', sleepAfterMs: 180000, chatter: true }, window.FREDA_BOT || {});
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LINES = {
    fr: {
      happy: ['Tout roule ! 😄', "J'adore quand ça marche 🎉", "Vous êtes en forme aujourd'hui !", 'Hihi 😁'],
      angry: ['Hmpf. 😤', 'Je fronce les sourcils… pour rien 😠', 'Qui a touché à mes cartes ?! 😤'],
      curious: ["Hmm… qu'est-ce qu'on fait là ? 🤔", 'Je regarde juste… 👀', 'Intéressant…', 'Ne faites pas attention à moi 👀'],
      surprised: ['Oh ! 😮', 'Wouah !', 'Hein ?!'],
      sad: ['Oups… 😕', 'Ça arrive aux meilleurs.'],
      wake: ['Hein ? Je ne dormais pas ! 😳', 'Je suis réveillé, promis !'],
      click: ["Besoin d'aide ? Cliquez encore pour me parler 💬"],
      tickle: ['Hihi, ça chatouille ! 😆', "Hé, c'est mon visage ça !"],
      error: ['Oups… on va régler ça 😬', 'Aïe. Respirez, on recommence 😅'],
      success: ['Bravo ! 🎉', 'Parfait 👌', 'Joli travail !'],
      typing: ['Je lis par-dessus votre épaule… 👀', 'Prenez votre temps, je surveille 😏', 'Hmm, bon choix 🤔'],
      sleepy: ['Zzz… je ferme les yeux deux secondes 😴', 'Je fais une petite sieste… 💤'],
      fastscroll: ['Wouh, pas si vite ! 😵'],
      clicks: ['Doucement avec la souris ! 😤'],
      peek: ["Qu'est-ce que c'est que ça ? 🧐", 'Je viens voir de plus près… 👀'],
    },
    en: {
      happy: ['All good! 😄', 'I love it when things work 🎉', 'Hehe 😁'],
      angry: ['Hmph. 😤', "I'm frowning… for no reason 😠"],
      curious: ['Hmm… what are we doing here? 🤔', 'Just looking… 👀', 'Interesting…'],
      surprised: ['Oh! 😮', 'Whoa!', 'Huh?!'],
      sad: ['Oops… 😕', 'It happens.'],
      wake: ["What? I wasn't sleeping! 😳"],
      click: ['Need help? Click again to talk to me 💬'],
      tickle: ['Hehe, that tickles! 😆'],
      error: ['Oops… we will fix it 😬'],
      success: ['Well done! 🎉', 'Perfect 👌'],
      typing: ['Reading over your shoulder… 👀', 'Take your time 😏'],
      fastscroll: ['Whoa, slow down! 😵'],
      clicks: ['Easy on the mouse! 😤'],
      peek: ['What is that? 🧐', 'Coming closer to look… 👀'],
    },
    ht: {
      happy: ['Tout bagay anfòm ! 😄', 'Mwen renmen lè l mache 🎉', 'Ou an fòm jodi a !', 'Hihi 😁'],
      angry: ['Hmpf. 😤', "M ap fronse sousi m… pou anyen 😠", 'Kiyès ki manyen kat mwen yo ?! 😤'],
      curious: ['Hmm… sa n ap fè la a ? 🤔', "M ap gade sèlman… 👀", 'Enteresan…', 'Pa okipe m 👀'],
      surprised: ['Oh ! 😮', 'Wouy !', 'Kisa ?!'],
      sad: ['Oups… 😕', 'Sa rive tout moun.'],
      wake: ["Kisa ? M pa t ap dòmi ! 😳", 'M reveye, m pwomèt !'],
      click: ['Ou bezwen èd ? Klike ankò pou pale ak Ajan IA a 💬'],
      tickle: ['Hihi, sa fè m giyò ! 😆', 'Ey, se figi m sa !'],
      error: ["Oups… n ap regle sa 😬", 'Aye. Respire, n ap rekòmanse 😅'],
      success: ['Bravo ! 🎉', 'Pafè 👌', 'Bèl travay !'],
      typing: ["M ap li dèyè zepòl ou… 👀", "Pran tan ou, m ap veye 😏", 'Hmm, bon chwa 🤔'],
      sleepy: ['Zzz… m fèmen je m de segonn 😴', 'M ap fè yon ti dòmi… 💤'],
      fastscroll: ['Wouy, dousman ! 😵'],
      clicks: ['Dousman ak sourit la ! 😤'],
      peek: ['Sa sa ye la a ? 🧐', "M vin gade pi pre… 👀"],
    },
  };

  var TIPS = {
    fr: {
      dashboard: ["Astuce : le Master Wallet paie vos cartes et leurs frais 💡", "Saviez-vous que je peux vous aider dans le chat ? Double-cliquez sur moi 💬", "Un solde bas ? Pensez à recharger le Master Wallet 💰", "Les frais de chaque opération sont dans Facturation 🧾", "Activez la 2FA pour protéger votre argent 🔐", "Je surveille vos paiements… enfin, je regarde 👀", "Besoin d'une clé API ? Section « Clés API » 🔑", "Vous pouvez tester en Sandbox sans risque 🧪", "Moi je ne dors jamais… enfin presque 😴", "Une question ? Je connais la réponse (ou je transmets à l'équipe) 😎"],
      landing: ["Créez un compte en 2 minutes, c'est gratuit 🚀", "Cartes virtuelles Visa et Mastercard par API 💳", "MonCash, Natcash et carte, un seul checkout 📲", "Regardez les tarifs : pas de frais cachés 🧾", "Le mode Sandbox est gratuit pour tout tester 🧪", "Une question ? Écrivez-nous, je transmets 💬", "Je suis la mascotte la plus mignonne de la fintech 😎", "Faites défiler, il y a plein de choses à voir 👇"],
      admin: ["Pensez à regarder les brouillons de l'agent IA ✍️", "Un dossier KYC attend peut-être 🛂", "Tout va bien dans les calculs ? Demandez à l'agent 🧮", "Les alertes sécurité, c'est important 🚨", "Café ? ☕", "Je veille sur la plateforme 👀"],
    },
    ht: {
      dashboard: ["Konsèy : Master Wallet la peye kat ou yo ak frè yo 💡", "Ou konnen mwen ka ede ou nan chat la ? Double-klike sou mwen 💬", "Balans ba ? Pense rechaje Master Wallet la 💰", "Ou jwenn frè chak operasyon nan Facturation 🧾", "Aktive 2FA pou pwoteje lajan ou 🔐", "M ap veye peman ou yo… enfin, m ap gade 👀", "Ou bezwen yon kle API ? Seksyon « Clés API » 🔑", "Ou ka teste nan Sandbox san danje 🧪", "Mwen pa janm dòmi… enfin prèske 😴", "Yon kesyon ? M konnen repons lan (oswa m transmèt ekip la) 😎"],
      landing: ["Kreye yon kont nan 2 minit, se gratis 🚀", "Kat vityèl Visa ak Mastercard pa API 💳", "MonCash, Natcash ak kat, yon sèl checkout 📲", "Gade tarif yo : pa gen frè kache 🧾", "Mòd Sandbox la gratis pou teste tout bagay 🧪", "Yon kesyon ? Ekri nou, m transmèt 💬", "Mwen se mascotte ki pi bèl nan fintech la 😎", "Desann paj la, gen anpil bagay pou wè 👇"],
      admin: ["Pa bliye gade bouyon ajan IA a ✍️", "Gen petèt yon dosye KYC k ap tann 🛂", "Tout bagay bon nan kalkil yo ? Mande ajan an 🧮", "Alèt sekirite yo enpòtan 🚨", "Yon kafe ? ☕", "M ap veye platfòm lan 👀"],
    },
    en: {
      dashboard: ["Tip: the Master Wallet pays for your cards and fees 💡", "Double-click me to open the chat 💬", "Low balance? Top up the Master Wallet 💰", "I never sleep… almost 😴"],
      landing: ["Create an account in 2 minutes, it's free 🚀", "Virtual Visa and Mastercard cards by API 💳", "MonCash, Natcash and card, one checkout 📲", "Sandbox is free to test everything 🧪", "Scroll down, there is a lot to see 👇", "I'm the cutest mascot in fintech 😎"],
      admin: ["Check the AI agent's drafts ✍️", "A KYC file may be waiting 🛂", "Coffee? ☕"],
    },
  };
  var INTRO = {
    fr: {
      dashboard: [
        { line: "Bonjour ! Moi, c'est {name} 👋 Je suis la mascotte de Freda Pay Issuing. Je vous fais visiter ?", mood: 'happy', ms: 4200 },
        { sel: '[data-section="balances"]', line: "Ici : vos soldes et votre Master Wallet. C'est lui qui paie vos cartes 💰", ms: 4200 },
        { sel: '[data-section="cards-business"]', line: "Ici, vous créez vos cartes virtuelles 💳", ms: 3800 },
        { sel: '[data-section="payments"]', line: "Et là, vos paiements MonCash, Natcash et carte 📲", ms: 3800 },
        { sel: '[data-section="settings"]', line: "Dans Paramètres : activez la 2FA, c'est obligatoire pour protéger votre argent 🔐", ms: 4200 },
        { sel: '#chatFab', line: "Un souci ? Écrivez dans le chat : l'assistant répond 24h/24 💬", ms: 4200 },
        { line: "Voilà ! Je reste dans mon coin. Double-cliquez sur moi quand vous voulez de l'aide 😉", mood: 'happy', ms: 4200 },
      ],
      landing: [
        { line: "Bonjour ! Moi, c'est {name} 👋 Bienvenue chez Freda Pay Issuing !", mood: 'happy', ms: 4000 },
        { sel: '#tarifs h2', line: "Ici, nos tarifs, sans frais cachés 🧾", ms: 3800 },
        { sel: 'a[href="/signup"]', line: "Et ici, vous créez votre compte en 2 minutes 🚀", ms: 4000 },
        { line: "Je reste dans le coin si vous avez besoin de moi 😉", mood: 'happy', ms: 3600 },
      ],
      admin: [
        { line: "Salut chef ! Moi, c'est {name} 🤖 Je veille sur la plateforme avec l'agent IA.", mood: 'happy', ms: 4200 },
        { sel: '[data-section="agent"]', line: "Ici : l'agent IA (emails, chat, KYC, rapports) ✍️", ms: 4200 },
        { line: "Double-clique sur moi pour l'ouvrir 😎", mood: 'happy', ms: 3600 },
      ],
    },
    ht: {
      dashboard: [
        { line: "Bonjou ! Mwen se {name} 👋 Mwen se mascotte Freda Pay Issuing. Ou vle m fè ou vizite ?", mood: 'happy', ms: 4200 },
        { sel: '[data-section="balances"]', line: "Isit la : balans ou yo ak Master Wallet ou. Se li ki peye kat ou yo 💰", ms: 4200 },
        { sel: '[data-section="cards-business"]', line: "Isit la, ou kreye kat vityèl ou yo 💳", ms: 3800 },
        { sel: '[data-section="payments"]', line: "Epi la a, peman MonCash, Natcash ak kat ou yo 📲", ms: 3800 },
        { sel: '[data-section="settings"]', line: "Nan Paramètres : aktive 2FA, li obligatwa pou pwoteje lajan ou 🔐", ms: 4200 },
        { sel: '#chatFab', line: "Yon pwoblèm ? Ekri nan chat la : asistan an reponn 24è/24 💬", ms: 4200 },
        { line: "Sa a ! M ap rete nan kwen m. Double-klike sou mwen lè ou bezwen èd 😉", mood: 'happy', ms: 4200 },
      ],
      landing: [
        { line: "Bonjou ! Mwen se {name} 👋 Byenvini nan Freda Pay Issuing !", mood: 'happy', ms: 4000 },
        { sel: '#tarifs h2', line: "Isit la, tarif nou yo, san frè kache 🧾", ms: 3800 },
        { sel: 'a[href="/signup"]', line: "Epi isit la, ou kreye kont ou nan 2 minit 🚀", ms: 4000 },
        { line: "M ap rete nan kwen an si ou bezwen m 😉", mood: 'happy', ms: 3600 },
      ],
      admin: [
        { line: "Salit chèf ! Mwen se {name} 🤖 M ap veye platfòm lan ak ajan IA a.", mood: 'happy', ms: 4200 },
        { sel: '[data-section="agent"]', line: "Isit la : ajan IA a (imèl, chat, KYC, rapò) ✍️", ms: 4200 },
        { line: "Double-klike sou mwen pou ouvri l 😎", mood: 'happy', ms: 3600 },
      ],
    },
    en: {
      dashboard: [
        { line: "Hi! I'm {name} 👋 the Freda Pay Issuing mascot. Shall I show you around?", mood: 'happy', ms: 4200 },
        { sel: '[data-section="balances"]', line: "Your balances and Master Wallet are here. It pays for your cards 💰", ms: 4200 },
        { sel: '[data-section="cards-business"]', line: "Create your virtual cards here 💳", ms: 3800 },
        { sel: '#chatFab', line: "Stuck? Write in the chat: the assistant answers 24/7 💬", ms: 4200 },
        { line: "That's it! Double-click me whenever you need help 😉", mood: 'happy', ms: 4000 },
      ],
      landing: [
        { line: "Hi! I'm {name} 👋 Welcome to Freda Pay Issuing!", mood: 'happy', ms: 4000 },
        { sel: '#tarifs h2', line: "Our pricing, no hidden fees 🧾", ms: 3800 },
        { sel: 'a[href="/signup"]', line: "And here you create your account in 2 minutes 🚀", ms: 4000 },
        { line: "I'll stay in the corner if you need me 😉", mood: 'happy', ms: 3600 },
      ],
      admin: [{ line: "Hi boss! I'm {name} 🤖", mood: 'happy', ms: 3800 }],
    },
  };
  var L = LINES[cfg.lang] || LINES.fr;
  var CTX = cfg.context in { dashboard: 1, landing: 1, admin: 1 } ? cfg.context : 'dashboard';
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var clickLanding = function () { return cfg.lang === 'ht' ? 'Yon lòt klik epi m mennen ou kreye kont ou 🚀' : cfg.lang === 'en' ? 'One more click and I take you to create your account 🚀' : 'Encore un clic et je vous emmène créer votre compte 🚀'; };
  var rand = function (a, b) { return a + Math.random() * (b - a); };

  var css = [
    '.fbot{position:fixed;left:0;top:0;z-index:59;width:var(--s);height:var(--s);pointer-events:none;will-change:transform;',
    '  transition:transform 1.05s cubic-bezier(.34,1.45,.64,1);--s:72px;--fx:0px;--fy:0px;--tilt:0deg}',
    '.fbot.fbot-fast{transition:transform .5s cubic-bezier(.34,1.45,.64,1)}',
    '.fbot-float{position:absolute;inset:0;animation:fbotBob 3.4s ease-in-out infinite}',
    '.fbot[data-mood=sleepy] .fbot-float{animation-duration:5.5s}',
    '.fbot-head{position:absolute;inset:0;border-radius:50%;pointer-events:auto;cursor:pointer;transform:rotate(var(--tilt));transition:transform .45s cubic-bezier(.34,1.56,.64,1);',
    '  background:radial-gradient(circle at 32% 26%,#ffffff 0%,#f7f8fb 38%,#e6e9f0 72%,#d3d8e2 100%);',
    '  box-shadow:0 calc(var(--s)*.14) calc(var(--s)*.3) calc(var(--s)*-.1) rgba(20,24,40,.28),0 6px 18px rgba(20,24,40,.16),inset calc(var(--s)*-.06) calc(var(--s)*-.08) calc(var(--s)*.16) rgba(30,40,70,.10)}',
    '.fbot-head::after{content:"";position:absolute;left:18%;top:9%;width:34%;height:16%;border-radius:50%;background:radial-gradient(ellipse at center,rgba(255,255,255,.95),rgba(255,255,255,0) 70%);pointer-events:none}',
    '.fbot-rim{position:absolute;left:10%;top:26%;width:80%;height:50%;border-radius:44%/50%;overflow:hidden;box-shadow:0 0 calc(var(--s)*.12) rgba(120,90,255,.35)}',
    '.fbot-rim::before{content:"";position:absolute;inset:-60%;background:conic-gradient(from 0deg,#c026ff,#7c3aed,#2563eb,#06b6d4,#22d3ee,#2563eb,#a21caf,#c026ff);animation:fbotSpin 6s linear infinite}',
    '.fbot[data-mood=angry] .fbot-rim::before{background:conic-gradient(from 0deg,#ef4444,#f97316,#dc2626,#fb7185,#ef4444);animation-duration:1.6s}',
    '.fbot[data-mood=happy] .fbot-rim::before{animation-duration:2.4s}',
    '.fbot[data-mood=sad] .fbot-rim::before{background:conic-gradient(from 0deg,#1d4ed8,#3b82f6,#60a5fa,#1e3a8a,#1d4ed8)}',
    '.fbot-screen{position:absolute;inset:calc(var(--s)*.045);border-radius:44%/50%;overflow:hidden;background:radial-gradient(ellipse at 50% 35%,#1b1f2b 0%,#0b0d14 60%,#05060a 100%);box-shadow:inset 0 2px 6px rgba(0,0,0,.6)}',
    '.fbot-gloss{position:absolute;left:12%;top:6%;width:62%;height:30%;border-radius:50%;background:linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,0));transform:rotate(-6deg);pointer-events:none}',
    '.fbot-face{position:absolute;inset:0;transform:translate(var(--fx),var(--fy));transition:transform .22s ease-out}',
    '.fbot-eye{position:absolute;box-sizing:border-box;top:28%;width:calc(var(--s)*.13);height:calc(var(--s)*.165);border-radius:50%;background:#fff;',
    '  box-shadow:0 0 calc(var(--s)*.05) #fff,0 0 calc(var(--s)*.13) rgba(150,215,255,.95),0 0 calc(var(--s)*.22) rgba(120,170,255,.55);',
    '  transform-origin:50% 55%;transition:transform .09s ease-in,height .2s,top .2s,border-radius .2s,background .2s}',
    '.fbot-eye.l{left:26%}.fbot-eye.r{right:26%}',
    '.fbot.fbot-blink .fbot-eye{transform:scaleY(.08)}',
    '.fbot-brow{position:absolute;top:13%;width:calc(var(--s)*.17);height:calc(var(--s)*.035);border-radius:9px;background:#fff;opacity:0;',
    '  box-shadow:0 0 calc(var(--s)*.05) #fff,0 0 calc(var(--s)*.1) rgba(150,215,255,.8);transition:opacity .2s,transform .25s cubic-bezier(.34,1.56,.64,1)}',
    '.fbot-brow.l{left:21%}.fbot-brow.r{right:21%}',
    '.fbot-cheek{position:absolute;top:70%;width:15%;height:8%;border-radius:50%;background:rgba(255,120,170,.55);filter:blur(1.5px);opacity:0;transition:opacity .3s}',
    '.fbot-cheek.l{left:14%}.fbot-cheek.r{right:14%}',
    /* happy : yeux en arc ^ ^ et joues roses */
    '.fbot[data-mood=happy] .fbot-eye{top:34%;height:calc(var(--s)*.07);background:transparent;border:calc(var(--s)*.03) solid #fff;border-bottom:0;border-radius:999px 999px 0 0;',
    '  box-shadow:none;filter:drop-shadow(0 0 3px #fff) drop-shadow(0 0 7px rgba(150,215,255,.95))}',
    '.fbot[data-mood=happy] .fbot-cheek{opacity:1}',
    /* angry : sourcils froncés, yeux plissés, petite secousse */
    '.fbot[data-mood=angry] .fbot-brow{opacity:1}',
    '.fbot[data-mood=angry] .fbot-brow.l{transform:translateY(calc(var(--s)*.03)) rotate(22deg)}',
    '.fbot[data-mood=angry] .fbot-brow.r{transform:translateY(calc(var(--s)*.03)) rotate(-22deg)}',
    '.fbot[data-mood=angry] .fbot-eye{transform:translateY(calc(var(--s)*.02)) scaleY(.68)}',
    '.fbot[data-mood=angry] .fbot-head{animation:fbotShake .45s ease-in-out 2}',
    /* sad */
    '.fbot[data-mood=sad] .fbot-brow{opacity:.9}',
    '.fbot[data-mood=sad] .fbot-brow.l{transform:rotate(-18deg)}.fbot[data-mood=sad] .fbot-brow.r{transform:rotate(18deg)}',
    '.fbot[data-mood=sad] .fbot-eye{transform:translateY(calc(var(--s)*.03)) scale(.85)}',
    /* surprised */
    '.fbot[data-mood=surprised] .fbot-eye{transform:scale(1.28)}',
    '.fbot[data-mood=surprised] .fbot-brow{opacity:.9;transform:translateY(calc(var(--s)*-.035))}',
    /* curious : tête penchée, un sourcil levé, un œil plissé */
    '.fbot[data-mood=curious] .fbot-brow.r{opacity:1;transform:translateY(calc(var(--s)*-.03)) rotate(-12deg)}',
    '.fbot[data-mood=curious] .fbot-eye.l{transform:scaleY(.72)}.fbot[data-mood=curious] .fbot-eye.r{transform:scale(1.14)}',
    /* sleepy */
    '.fbot[data-mood=sleepy] .fbot-eye{transform:translateY(calc(var(--s)*.035)) scaleY(.22)}',
    '.fbot-fx{position:absolute;right:-6%;top:-14%;font:700 calc(var(--s)*.22)/1 system-ui,sans-serif;color:#7c3aed;opacity:0;pointer-events:none}',
    '.fbot[data-mood=sleepy] .fbot-fx{opacity:1;animation:fbotZ 2.4s ease-in-out infinite}',
    '.fbot[data-mood=angry] .fbot-fx{opacity:1;color:#ef4444;animation:fbotPop .6s ease-out}',
    '.fbot-shadow{position:absolute;left:18%;bottom:-12%;width:64%;height:10%;border-radius:50%;background:rgba(20,24,40,.18);filter:blur(3px);animation:fbotShadow 3.4s ease-in-out infinite}',
    '.fbot-bubble{position:absolute;bottom:calc(100% + 10px);right:-4px;max-width:230px;width:max-content;background:#fff;color:#111;font:600 13px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;',
    '  padding:8px 11px;border-radius:14px;box-shadow:0 10px 26px -8px rgba(20,24,40,.35);border:1px solid #ececf2;opacity:0;transform:translateY(6px) scale(.96);',
    '  transform-origin:90% 100%;transition:opacity .2s,transform .25s cubic-bezier(.34,1.56,.64,1);pointer-events:none;white-space:normal}',
    '.fbot-bubble::after{content:"";position:absolute;right:22px;bottom:-6px;width:11px;height:11px;background:#fff;border-right:1px solid #ececf2;border-bottom:1px solid #ececf2;transform:rotate(45deg)}',
    '.fbot-bubble.show{opacity:1;transform:none}',
    '.fbot.fbot-left .fbot-bubble{right:auto;left:-4px;transform-origin:10% 100%}.fbot.fbot-left .fbot-bubble::after{right:auto;left:22px}',
    '.fbot.fbot-boing .fbot-head{animation:fbotBoing .55s cubic-bezier(.34,1.56,.64,1)}',
    '@keyframes fbotBob{0%,100%{transform:translateY(0)}50%{transform:translateY(calc(var(--s)*-.07))}}',
    '@keyframes fbotShadow{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(.82);opacity:.55}}',
    '@keyframes fbotSpin{to{transform:rotate(360deg)}}',
    '@keyframes fbotShake{0%,100%{transform:rotate(var(--tilt)) translateX(0)}25%{transform:rotate(var(--tilt)) translateX(-3px)}75%{transform:rotate(var(--tilt)) translateX(3px)}}',
    '@keyframes fbotBoing{0%{transform:scale(1)}30%{transform:scale(1.14,.86)}60%{transform:scale(.93,1.08)}100%{transform:scale(1)}}',
    '@keyframes fbotZ{0%{transform:translate(0,0);opacity:0}30%{opacity:1}100%{transform:translate(8px,-14px);opacity:0}}',
    '@keyframes fbotPop{0%{transform:scale(.3)}60%{transform:scale(1.3)}100%{transform:scale(1)}}',
    '@media (prefers-reduced-motion: reduce){.fbot,.fbot.fbot-fast{transition:none}.fbot-float,.fbot-shadow,.fbot-rim::before{animation:none}}',
    '@media print{.fbot{display:none}}',
  ].join('\n');

  function start() {
    if (document.getElementById('fbot')) return;
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var root = document.createElement('div');
    root.id = 'fbot';
    root.className = 'fbot';
    root.setAttribute('aria-hidden', 'true');
    root.dataset.mood = 'neutral';
    root.innerHTML = '<div class="fbot-bubble"></div><div class="fbot-shadow"></div><div class="fbot-float"><div class="fbot-head">'
      + '<div class="fbot-cheek l"></div><div class="fbot-cheek r"></div>'
      + '<div class="fbot-rim"><div class="fbot-screen"><div class="fbot-face"><i class="fbot-brow l"></i><i class="fbot-brow r"></i><i class="fbot-eye l"></i><i class="fbot-eye r"></i></div><div class="fbot-gloss"></div></div></div>'
      + '</div><div class="fbot-fx"></div></div>';
    document.body.appendChild(root);

    var head = root.querySelector('.fbot-head');
    var bubble = root.querySelector('.fbot-bubble');
    var fx = root.querySelector('.fbot-fx');
    var S = cfg.size;
    var pos = { x: -200, y: -200 };
    var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, at: 0 };
    var lookTarget = null; // an element or a point the bot is busy watching
    var away = false;      // visiting something away from its corner
    var lastActivity = Date.now();
    var moodTimer = null; var bubbleTimer = null; var returnTimer = null;
    var introRunning = false;
    var lastVisit = 0; var lastTickle = 0; var clickArmedAt = 0;

    function size() {
      S = window.innerWidth < 600 ? Math.round(cfg.size * 0.78) : cfg.size;
      root.style.setProperty('--s', S + 'px');
    }
    function visible(el) { if (!el) return false; var r = el.getBoundingClientRect(); var st = getComputedStyle(el); return r.width > 0 && r.height > 0 && st.display !== 'none' && st.visibility !== 'hidden' && !el.hidden; }

    // Its corner: bottom-right, above the chat button when there is one, and beside the chat window when it is open (it watches the conversation).
    function homePoint() {
      var w = window.innerWidth; var h = window.innerHeight;
      var box = document.getElementById('chatBox');
      if (visible(box)) { var r = box.getBoundingClientRect(); return { x: Math.max(8, r.left - S - 18), y: Math.min(h - S - 26, r.bottom - S) }; }
      var fab = document.getElementById('chatFab');
      var lift = visible(fab) ? fab.getBoundingClientRect().height + 34 : 26;
      // A message (toast) is showing in the corner: it steps aside and looks at it instead of hiding behind it.
      var toasts = document.querySelector('.toast-container');
      if (toasts && toasts.children.length) {
        var t = toasts.getBoundingClientRect();
        if (t.height > 4 && t.width > 4) return { x: Math.max(8, t.left - S - 16), y: Math.min(h - S - lift, t.top + t.height / 2 - S / 2) };
      }
      return { x: w - S - 24, y: h - S - lift };
    }
    function place(x, y, fast) {
      pos.x = Math.max(6, Math.min(window.innerWidth - S - 6, x));
      pos.y = Math.max(40, Math.min(window.innerHeight - S - 10, y));
      root.classList.toggle('fbot-fast', !!fast);
      root.classList.toggle('fbot-left', pos.x < 250);
      root.style.transform = 'translate3d(' + Math.round(pos.x) + 'px,' + Math.round(pos.y) + 'px,0)';
    }
    function goHome(fast) { away = false; lookTarget = null; var p = homePoint(); place(p.x, p.y, fast); }

    // The eyes (and a little of the head) follow what it watches: the mouse, or the element it came to see.
    function lookAt(tx, ty) {
      var cx = pos.x + S / 2; var cy = pos.y + S / 2;
      var dx = tx - cx; var dy = ty - cy; var d = Math.sqrt(dx * dx + dy * dy) || 1;
      var k = Math.min(1, d / 260);
      root.style.setProperty('--fx', ((dx / d) * k * S * 0.1).toFixed(1) + 'px');
      root.style.setProperty('--fy', ((dy / d) * k * S * 0.075).toFixed(1) + 'px');
      if (root.dataset.mood !== 'curious') root.style.setProperty('--tilt', ((dx / d) * k * 7).toFixed(1) + 'deg');
    }
    function track() {
      if (lookTarget && lookTarget.getBoundingClientRect) {
        var r = lookTarget.getBoundingClientRect();
        lookAt(r.left + Math.min(r.width * 0.7, 260), r.top + r.height / 2);
      } else if (lookTarget) lookAt(lookTarget.x, lookTarget.y);
      else lookAt(mouse.x, mouse.y);
      requestAnimationFrame(track);
    }

    function say(text, ms) {
      if (!text) return;
      bubble.textContent = text;
      bubble.classList.add('show');
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(function () { bubble.classList.remove('show'); }, ms || 3200);
    }
    function setMood(m, ms, line) {
      clearTimeout(moodTimer);
      root.dataset.mood = m;
      fx.textContent = m === 'sleepy' ? 'z z' : m === 'angry' ? '💢' : '';
      if (m === 'curious') root.style.setProperty('--tilt', (Math.random() < 0.5 ? -14 : 14) + 'deg');
      if (line) say(line);
      if (ms) moodTimer = setTimeout(function () { if (root.dataset.mood === m) setMood('neutral'); }, ms);
    }
    function boing() { root.classList.remove('fbot-boing'); void root.offsetWidth; root.classList.add('fbot-boing'); }

    // Normal blinking, sometimes twice in a row.
    function blink() {
      var m = root.dataset.mood;
      if (m !== 'happy') {
        root.classList.add('fbot-blink');
        setTimeout(function () { root.classList.remove('fbot-blink'); }, 120);
        if (Math.random() < 0.18) setTimeout(function () { root.classList.add('fbot-blink'); setTimeout(function () { root.classList.remove('fbot-blink'); }, 110); }, 260);
      }
      setTimeout(blink, rand(2200, 5600));
    }

    // When nobody moves the mouse its eyes dart around, like in the video.
    function glance() {
      if (!lookTarget && Date.now() - mouse.at > 2500 && root.dataset.mood !== 'sleepy') {
        var p = { x: rand(0, window.innerWidth), y: rand(0, window.innerHeight) };
        lookTarget = p;
        setTimeout(function () { if (lookTarget === p) lookTarget = null; }, rand(700, 1600));
      }
      setTimeout(glance, rand(2500, 6000));
    }

    // Comes close to an element, leans and watches it, then goes back to its corner.
    function visit(el, line, stay) {
      if (reduceMotion || window.innerWidth < 760 || !el) return;
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var x = r.right + 14 + S <= window.innerWidth ? r.right + 14 : r.left - S - 14;
      var y = r.top + r.height / 2 - S / 2;
      away = true; lastVisit = Date.now();
      lookTarget = el;
      place(x, y);
      setTimeout(function () { setMood('curious', (stay || 4500) - 400, line); }, 500);
      clearTimeout(returnTimer);
      returnTimer = setTimeout(function () { goHome(); }, stay || 4500);
    }

    // Moods now and then, to keep it alive (and a frown once in a while, for nothing).
    function randomMood() {
      if (root.dataset.mood === 'neutral' && !away && !introRunning && Date.now() - lastActivity < cfg.sleepAfterMs) {
        var r = Math.random();
        if (r < 0.42) setMood('happy', 2600, Math.random() < 0.4 ? pick(L.happy) : null);
        else if (r < 0.62) setMood('curious', 2600, Math.random() < 0.3 ? pick(L.curious) : null);
        else if (r < 0.76) setMood('surprised', 1400, Math.random() < 0.3 ? pick(L.surprised) : null);
        else if (r < 0.9) setMood('angry', 2200, Math.random() < 0.5 ? pick(L.angry) : null);
        else setMood('sad', 2000, null);
      }
      setTimeout(randomMood, rand(9000, 20000));
    }
    // Sometimes it goes to look at something on the page by itself.
    function peek() {
      if (!away && !introRunning && root.dataset.mood !== 'sleepy' && Date.now() - lastVisit > 30000 && Date.now() - lastActivity < cfg.sleepAfterMs) {
        var cand = [].slice.call(document.querySelectorAll('h1,h2,.card-title,.section-title,.stat-card,button.btn-primary,table'))
          .filter(function (el) { var r = el.getBoundingClientRect(); return visible(el) && r.top > 60 && r.bottom < window.innerHeight - 60 && !root.contains(el); });
        if (cand.length) visit(pick(cand), Math.random() < 0.6 ? pick(L.peek) : null, 3800);
      }
      setTimeout(peek, rand(22000, 45000));
    }
    // Asleep after a while without anyone around.
    function sleepCheck() {
      if (!introRunning && Date.now() - lastActivity > cfg.sleepAfterMs && root.dataset.mood !== 'sleepy') { if (away) goHome(); setMood('sleepy', 0, null); say(pick(L.sleepy || ['💤']), 2200); }
      setTimeout(sleepCheck, 5000);
    }
    function activity() {
      lastActivity = Date.now();
      if (root.dataset.mood === 'sleepy') { setMood('surprised', 900); boing(); setTimeout(function () { say(pick(L.wake)); }, 250); }
    }

    // It talks now and then, about the page it is on (tips, jokes), as long as someone is around.
    function chatter() {
      if (cfg.chatter && !introRunning && !away && root.dataset.mood !== 'sleepy' && Date.now() - lastActivity < cfg.sleepAfterMs && !document.hidden) {
        var tips = (TIPS[cfg.lang] || TIPS.fr)[CTX] || [];
        if (tips.length) {
          var r = Math.random();
          setMood(r < 0.5 ? 'happy' : r < 0.8 ? 'curious' : 'surprised', 2400, pick(tips));
          if (r < 0.3) boing();
        }
      }
      setTimeout(chatter, rand(13000, 26000));
    }

    // First visit: it comes to introduce itself and shows the important places, one after the other.
    function seenIntro() { try { return !!localStorage.getItem(cfg.introKey + ':' + CTX); } catch (e) { return false; } }
    function markIntro() { try { localStorage.setItem(cfg.introKey + ':' + CTX, String(Date.now())); } catch (e) { /* private mode: it will introduce itself again next time */ } }
    function runIntro(force) {
      var steps = ((INTRO[cfg.lang] || INTRO.fr)[CTX] || []).slice();
      if (!steps.length || introRunning) return;
      introRunning = true; clearTimeout(returnTimer); markIntro();
      var small = window.innerWidth < 760 || reduceMotion;
      var startY = window.scrollY;
      var i = 0;
      function next() {
        if (i >= steps.length) { introRunning = false; goHome(); setMood('happy', 2200); boing(); try { window.scrollTo({ top: startY, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, startY); } return; }
        var st = steps[i]; i += 1;
        var line = String(st.line).replace('{name}', cfg.name);
        var el = st.sel && !small ? document.querySelector(st.sel) : null;
        if (el && visible(el)) {
          // The place is scrolled into view first, then the bot goes next to it.
          var r0 = el.getBoundingClientRect();
          var offscreen = r0.top < 80 || r0.bottom > window.innerHeight - 80;
          if (offscreen) { try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { el.scrollIntoView(); } }
          setTimeout(function () {
            var r = el.getBoundingClientRect();
            var x = r.right + 14 + S <= window.innerWidth ? r.right + 14 : r.left - S - 14;
            away = true; lookTarget = el; place(x, Math.min(window.innerHeight - S - 20, Math.max(80, r.top + Math.min(r.height, 120) / 2 - S / 2)));
            setTimeout(function () { setMood(st.mood || 'curious', 0, line); say(line, st.ms || 4000); boing(); }, 650);
          }, offscreen ? 850 : 0);
          setTimeout(next, (st.ms || 4000) + 900 + (offscreen ? 850 : 0));
        } else {
          away = false; lookTarget = null;
          if (i === 1) { var c = homePoint(); place(Math.max(20, c.x - 80), Math.max(80, c.y - 120)); } else goHome();
          setMood(st.mood || 'happy', 0, line); say(line, st.ms || 4000); boing();
          setTimeout(next, (st.ms || 4000) + 600);
        }
      }
      setTimeout(next, force ? 100 : 400);
    }
    // The intro waits until the page is really there (a dashboard shows its login first).
    function introWhenReady(tries) {
      if (!cfg.intro || seenIntro()) return;
      var ready = CTX === 'landing' ? true : !!document.querySelector('[data-section]') && visible(document.querySelector('[data-section]'));
      if (ready) { setTimeout(function () { if (!seenIntro()) runIntro(); }, 1200); return; }
      if (tries < 40) setTimeout(function () { introWhenReady(tries + 1); }, 1000);
    }

    var clicks = [];
    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.at = Date.now(); activity();
      if (lookTarget && !lookTarget.getBoundingClientRect) lookTarget = null;
      var dx = e.clientX - (pos.x + S / 2); var dy = e.clientY - (pos.y + S / 2);
      if (Math.sqrt(dx * dx + dy * dy) < S * 0.9 && Date.now() - lastTickle > 9000 && root.dataset.mood === 'neutral') {
        lastTickle = Date.now(); setMood('surprised', 600); setTimeout(function () { setMood('happy', 1800, pick(L.tickle)); }, 600);
      }
    }, { passive: true });
    document.addEventListener('touchstart', function (e) { var t = e.touches[0]; if (t) { mouse.x = t.clientX; mouse.y = t.clientY; mouse.at = Date.now(); } activity(); }, { passive: true });
    document.addEventListener('keydown', activity, true);
    document.addEventListener('click', function (e) {
      activity();
      if (root.contains(e.target)) return;
      var now = Date.now();
      clicks = clicks.filter(function (t) { return now - t < 1500; }); clicks.push(now);
      if (clicks.length >= 6 && root.dataset.mood !== 'angry') { clicks = []; setMood('angry', 2400, pick(L.clicks)); }
    }, true);
    var lastScroll = { y: window.scrollY, t: Date.now(), dist: 0 };
    window.addEventListener('scroll', function () {
      activity();
      var now = Date.now();
      if (now - lastScroll.t > 1000) lastScroll = { y: window.scrollY, t: now, dist: 0 };
      lastScroll.dist += Math.abs(window.scrollY - lastScroll.y); lastScroll.y = window.scrollY;
      if (lastScroll.dist > 2200 && root.dataset.mood === 'neutral') { lastScroll.dist = 0; setMood('surprised', 1500, pick(L.fastscroll)); }
    }, { passive: true, capture: true });

    // Typing in a field: it comes to read over the shoulder (at most every 25 s).
    var typingTimer = null;
    document.addEventListener('input', function (e) {
      var el = e.target;
      if (!el || root.contains(el) || !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.type === 'password') return;
      clearTimeout(typingTimer);
      typingTimer = setTimeout(function () {
        if (!introRunning && Date.now() - lastVisit > 25000 && document.activeElement === el) visit(el, Math.random() < 0.55 ? pick(L.typing) : null, 5000);
      }, 900);
    }, true);
    document.addEventListener('focusout', function (e) { if (away && lookTarget === e.target) { clearTimeout(returnTimer); returnTimer = setTimeout(function () { goHome(); }, 600); } }, true);

    // The page's own messages: a success makes it happy, an error makes it frown.
    function hookToasts() {
      if (typeof window.showToast !== 'function' || window.showToast.__fbot) return;
      var orig = window.showToast;
      var wrapped = function (msg, type) {
        var out = orig.apply(this, arguments);
        if (type === 'error') setMood(Math.random() < 0.6 ? 'sad' : 'angry', 2600, pick(L.error));
        else if (type === 'success') { setMood('happy', 2600, pick(L.success)); boing(); }
        return out;
      };
      wrapped.__fbot = true;
      window.showToast = wrapped;
    }

    // A click says hello; a second click within a few seconds opens the assistant (chat on the dashboard, the AI agent in the admin).
    head.addEventListener('click', function (e) {
      e.stopPropagation();
      activity(); boing();
      if (Date.now() - clickArmedAt < 4000 && typeof cfg.onClick === 'function') { clickArmedAt = 0; setMood('happy', 1500); cfg.onClick(); return; }
      clickArmedAt = Date.now();
      setMood('happy', 2200, typeof cfg.onClick === 'function' ? (CTX === 'landing' ? clickLanding() : pick(L.click)) : pick(L.tickle));
    });

    size();
    goHome(true);
    setTimeout(function () { setMood('happy', 1800); boing(); }, 900);
    requestAnimationFrame(track);
    setTimeout(blink, 1800);
    setTimeout(glance, 4000);
    setTimeout(randomMood, 9000);
    setTimeout(chatter, 9000);
    introWhenReady(0);
    setTimeout(peek, 35000);
    setTimeout(sleepCheck, 10000);
    hookToasts(); setTimeout(hookToasts, 1500);
    window.addEventListener('resize', function () { size(); if (!away) goHome(true); });
    // The chat window opening or closing moves its corner.
    setInterval(function () { if (!away) { var p = homePoint(); if (Math.abs(p.x - pos.x) > 4 || Math.abs(p.y - pos.y) > 4) place(p.x, p.y); } }, 700);

    window.FredaBot = { mood: setMood, say: say, visit: visit, home: goHome, intro: function () { runIntro(true); } };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
