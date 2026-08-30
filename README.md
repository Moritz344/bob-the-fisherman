
<h1 align="center"> 
  <img width="180" height="180" alt="bob" src="https://github.com/user-attachments/assets/25292f6c-2992-464e-93be-676711801f0e" />
  <br>
  Bob The Fisherman 
</h1>

Minecraft bot for AFK fishing, built on Mineflayer.

> [!WARNING]
> **This project is a work in progress. Expect changes and possible instability.**

<img width="1084" height="748" alt="screenshot-2026-08-30_11-35-36" src="https://github.com/user-attachments/assets/4b1c3a50-fbaf-4fe1-a8fa-95153156b9e0" />



<details>
  <summary> More Screenshots </summary>
  <img width="1084" height="748" alt="screenshot-2026-08-30_11-35-40" src="https://github.com/user-attachments/assets/bcc01d7a-97af-49ba-855c-26d5b1fde276" />
  <img width="1084" height="748" alt="screenshot-2026-08-30_11-35-45" src="https://github.com/user-attachments/assets/3a0ac0ad-8425-4da1-af95-e9946e139247" />
  <img width="1084" height="748" alt="screenshot-2026-08-30_11-35-48" src="https://github.com/user-attachments/assets/bffca001-a8c7-4711-9af9-147a5dc86630" />



  <img width="1916" height="1080" alt="screenshot-2026-06-11_16-48-00" src="https://github.com/user-attachments/assets/762d5786-fd4b-4a4b-a22b-a4803e1eba81" />


</details>

# Features
- [x] Start/Stop fishing
- [x] Send and receive ingame chat messages
- [x] Join Singleplayer/Multiplayer Worlds
- [x] Follow a player
- [x] Deposit loot in a chest
- [x] Drop loot from inventory

# Usage
```bash
git clone https://github.com/Moritz344/bob-the-fisherman.git
cd bob-the-fisherman/
```
There is a cli and gui.

## CLI
Located at `bob-the-fisherman/cli/` - Bun project.
```bash
cd bob-the-fisherman/
cd cli/
bun install
bun run index.ts
```
<details>
  <summary>Screenshot</summary>
  <img width="970" height="612" alt="screenshot-2026-06-05_15-14-03" src="https://github.com/user-attachments/assets/8d29c12f-9da8-4158-a8ed-e7f2952968d7" />
</details>

## App
Angular + Electron app.
```bash
cd bob-the-fisherman/
npm install
npm start
```
