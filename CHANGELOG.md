# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.186](https://github.com/Moritz344/bob-the-fisherman/compare/v0.0.185...v0.0.186) (2026-09-21)


### Features

* add loading indicator with text ([4c2500e](https://github.com/Moritz344/bob-the-fisherman/commit/4c2500e0cf866bedc8989b3b24c14315e717d9b0))
* add option to minimize and menu for closing the app and opening the about window ([9228169](https://github.com/Moritz344/bob-the-fisherman/commit/9228169fb5f7e2de711c5865866c9bbd528a5978))
* add prefix for commands,add function to get head texture of bot ([602c0f5](https://github.com/Moritz344/bob-the-fisherman/commit/602c0f5e922af4aa94642460e57f0306f99d7b63))
* expose and make ipc handler for sending chat messages ([f87032a](https://github.com/Moritz344/bob-the-fisherman/commit/f87032a2ccdd491521be076e35cb1af519484447))
* fix reconnecting when bot stopped manually,log chat messages from mc server,send skin data ([2fc0824](https://github.com/Moritz344/bob-the-fisherman/commit/2fc0824508bef529b8b0e204cbb92cf622f2db58))
* give proper reason on why the bot got kicked ([4f44dff](https://github.com/Moritz344/bob-the-fisherman/commit/4f44dffd809753886828632b4c94b564f6390eac))
* if no command found send message in mc chat ([dec282b](https://github.com/Moritz344/bob-the-fisherman/commit/dec282b7a808ffa603bb0f75c3fdd0be5435097f))
* interface for SkinData of bot,implement function to get skin data of bot ([3e4a501](https://github.com/Moritz344/bob-the-fisherman/commit/3e4a5015db7181150ba357ad82add2559cbfc961))
* log a friendly error message for the error event,if bot got kicked and was fishing continue fishing task on reconnect ([6079c6b](https://github.com/Moritz344/bob-the-fisherman/commit/6079c6be3726fd262dab7bb32d560e682d195adf))
* paste in the last thing you entered with ArrowDown key ([7bff999](https://github.com/Moritz344/bob-the-fisherman/commit/7bff99941f8147e576767af5d0827d3be1277d12))
* remove window frame and add roundedCorners,add exit ipc handler ([9fc7088](https://github.com/Moritz344/bob-the-fisherman/commit/9fc70883d5b84115391f2efeba520b5f97ab21a0))
* show minecraft head texture of bot and username of bot ([18074ab](https://github.com/Moritz344/bob-the-fisherman/commit/18074ab0f056ae84287d62d8ba6febb472da347c))


### Bug Fixes

* bot stopping on death ([449692d](https://github.com/Moritz344/bob-the-fisherman/commit/449692d22d54d33de787d9c68f875214319182ae))
* bot stopping when not ready ([c8b276a](https://github.com/Moritz344/bob-the-fisherman/commit/c8b276a1368ed70da98d89bfb8d1ebb056bc7917))
* deposit command not working when whispering also remove logs and await keyword ([2dca07a](https://github.com/Moritz344/bob-the-fisherman/commit/2dca07a0593d3a68e2c9343bc097d7f05c431aa8))
* dont reconnect on bot error ([e61a93d](https://github.com/Moritz344/bob-the-fisherman/commit/e61a93d54becb4249c34f23e70bb5405b3f680a1))
* follow command not working => removed line that defines playerEntity on accident ([f28ea3e](https://github.com/Moritz344/bob-the-fisherman/commit/f28ea3ee6133e7a7c9b2460bb2ae7fa75a31e592))
* forgot to remove hardcoded path and only show normal mc messages no admin commands etc ([752a2fb](https://github.com/Moritz344/bob-the-fisherman/commit/752a2fbdbf6ad497da1330b1ce08cdeec56f082f))
* height ([ae91c31](https://github.com/Moritz344/bob-the-fisherman/commit/ae91c313b2260272063059b0bafbc7fe9e2ea5ea))
* listing only cli tool commands ([af64cf8](https://github.com/Moritz344/bob-the-fisherman/commit/af64cf827a5d92825f387f80b75c5df23351e677))
* move stopFishing and isFollowing checks after early return,also start fishing after depositing if bot was fishing ([85e385e](https://github.com/Moritz344/bob-the-fisherman/commit/85e385e4993a13cb893d4d687831b8d823d06855))
* not automatically scrolling to the bottom pressing enter ([bb89e7b](https://github.com/Moritz344/bob-the-fisherman/commit/bb89e7b573a49bcb2b7ccaca000ae93da1bbf189))
* not reconnecting after bot got kicked and check if shouldReconnect is true ([7caeeac](https://github.com/Moritz344/bob-the-fisherman/commit/7caeeac0ebdc76f1f0d7d9ae92d874ee3dd2fe91))
* only set currentSelected if settings is not undefined ([0226dee](https://github.com/Moritz344/bob-the-fisherman/commit/0226deeecd8f0f61c9fd13c01e434bea0639bdda))
* overflow with the whole page ([b2e3a05](https://github.com/Moritz344/bob-the-fisherman/commit/b2e3a05cc62c8061e4812f562fb0617afbf1b32b))
* remove bg from chat log,fix input not being at the bottom, ([59f9036](https://github.com/Moritz344/bob-the-fisherman/commit/59f9036fac79279f710ab574118fbf5a94c2f012))
* remove import and use field title instead of authTitle ([14f9e8d](https://github.com/Moritz344/bob-the-fisherman/commit/14f9e8d818c9e18f2233b2a2cb3a40495c6a3877))
* remove spellcheck on search input and slice the message from index 1 so messages with a ":" get correctly shown ([50cb2c3](https://github.com/Moritz344/bob-the-fisherman/commit/50cb2c333e25b2e619ec79e57ad7b6c0c0ff8f94))
* remove unused code,check generalSettings before setting model ([38753a8](https://github.com/Moritz344/bob-the-fisherman/commit/38753a83425e0eaf6957fcd09b77686c63557be0))
* set currentTask to Nothing if a log with level warn got send ([932f1d1](https://github.com/Moritz344/bob-the-fisherman/commit/932f1d12b15946449859419946d0e6254022d91c))
* set started to false on error, ([bb022a7](https://github.com/Moritz344/bob-the-fisherman/commit/bb022a7db6b6f284c141939ca953826469db5aa6))
* setting ui to Stopped when providing no item name for drop command ([2331fa7](https://github.com/Moritz344/bob-the-fisherman/commit/2331fa7eb2c734d5a916270b869bb029a43dad92))
* stop current task before stopping bot ([85b9b88](https://github.com/Moritz344/bob-the-fisherman/commit/85b9b88e0d98ccdead244342d6656424246b215a))
* stop the bot on error ([bcb2321](https://github.com/Moritz344/bob-the-fisherman/commit/bcb2321bbf6580f8ca787aad4b1290908a85f84d))
* typo,remove placeholder ([22afc03](https://github.com/Moritz344/bob-the-fisherman/commit/22afc03bb6abde8e9c5db0edee6e5324ed5485d6))
* ui showing the bot stopped even tho it didnt => dont use log level error instead use warn and change max distance for the chest ([6b474ee](https://github.com/Moritz344/bob-the-fisherman/commit/6b474ee71f4cd9c042a245ed9420c598e117deba))
* use separate auth cache folder for Microsoft login ([83df02a](https://github.com/Moritz344/bob-the-fisherman/commit/83df02a41586f3e63685684701561151538878d4))
* used wrong path ([4dc9543](https://github.com/Moritz344/bob-the-fisherman/commit/4dc9543e4b5650e74314131c8ae0fbf459b67d8c))
* when selecting command focus input ([f9a4375](https://github.com/Moritz344/bob-the-fisherman/commit/f9a4375e3e22b28050d9d2c726173840442a6c7d))

### [0.0.185](https://github.com/Moritz344/bob-the-fisherman/compare/v0.0.184...v0.0.185) (2026-07-05)


### Features

* add drop button on right side of each item ([e1a0f9c](https://github.com/Moritz344/bob-the-fisherman/commit/e1a0f9cf78953eda4e3170e66d7b1e9bfc7323d4))
* add drop item command,function for setting the bot fishing cooldown ([313f7f1](https://github.com/Moritz344/bob-the-fisherman/commit/313f7f126336ad0510a92d5b2782dfc1bc590a63))
* add help command,change command description ([7c12a1f](https://github.com/Moritz344/bob-the-fisherman/commit/7c12a1f52abc8d39cb379f3cf3bb77669d47af28))
* add ipc handler for stop-current-task ([9695e58](https://github.com/Moritz344/bob-the-fisherman/commit/9695e583214b539713d035e88571c2580765c4dc))
* add stop current task function ([026843f](https://github.com/Moritz344/bob-the-fisherman/commit/026843ffa3ddc4cc5f5281b50ce63bf9fe9629e8))
* add stopCurrentTask method in settings service ([bab4366](https://github.com/Moritz344/bob-the-fisherman/commit/bab436676b320e611de4643ae68ad356add90283))
* create ipc handler for drop and help command ([ac4d944](https://github.com/Moritz344/bob-the-fisherman/commit/ac4d944ad4a1984219b71352e0d1f8650a8ba3ec))
* create profiles.json with example profile if file is not found ([6533505](https://github.com/Moritz344/bob-the-fisherman/commit/6533505593810758980b508944fe306575c4e834))
* expose stopCurrentTask function ([afc92db](https://github.com/Moritz344/bob-the-fisherman/commit/afc92db0677020525297f56afc863158cf1222e0))
* log bot death,load minimal config file,add drop command ([dda5928](https://github.com/Moritz344/bob-the-fisherman/commit/dda5928edef2694d6d580e6e8492f44ced4e1a16))
* use shared help command function ([c28931d](https://github.com/Moritz344/bob-the-fisherman/commit/c28931d3c155037a27de04b93134a3f40b1e28f6))


### Bug Fixes

* bot starts fishing too fast ([a5edc0f](https://github.com/Moritz344/bob-the-fisherman/commit/a5edc0f01f1f914c6053fa19e6e822b78466b183))
* commands command not showing anything,added profile command to load profiles from profiles.json,hide error message if error message is empty ([c275979](https://github.com/Moritz344/bob-the-fisherman/commit/c2759798f74ecea657c135bb15ea0e696db57dd9))
* commands not working in log component ([f19d8d7](https://github.com/Moritz344/bob-the-fisherman/commit/f19d8d73384a6ad3d6cdd9bb1c0abe0b09244ef1))
* error message playerToFollow not found => comment getActionSetting not needed right now ([a51e1a9](https://github.com/Moritz344/bob-the-fisherman/commit/a51e1a93406b3ca848740e1563dca7938705f34f))
* if no error message show fallback ([5a20f10](https://github.com/Moritz344/bob-the-fisherman/commit/5a20f104b13d4b9580a3f6c2405c2ade66d79085))
* loot table still showed old loot when depositing items ([dd7cf55](https://github.com/Moritz344/bob-the-fisherman/commit/dd7cf551d8ca6419a942b184cda594a3a4a3664b))
* loot table was not updating after dropping item ([13ba23b](https://github.com/Moritz344/bob-the-fisherman/commit/13ba23b379a7eadb4cc5976d68d53a92fb56389c))

### [0.0.184](https://github.com/Moritz344/bob-the-fisherman/compare/v0.0.183...v0.0.184) (2026-06-28)


### Features

* add deposit command ([1a35ca7](https://github.com/Moritz344/bob-the-fisherman/commit/1a35ca7e3ff6bab8a6c21961c3fb2715b1beab5a))
* add deposit loot function for app ([27c991b](https://github.com/Moritz344/bob-the-fisherman/commit/27c991b2f590dfbe3998de7eeb38d088bf8103d1))
* add depositLoot function ([0e0b40b](https://github.com/Moritz344/bob-the-fisherman/commit/0e0b40b397e3e5448ada04d04d5e0fd4903d2782))
* expose depositLoot function ([dd17b71](https://github.com/Moritz344/bob-the-fisherman/commit/dd17b712e715d212239956a249d91b96dca1eca7))

### 0.0.183 (2026-06-27)


### Features

* add deposit command ([abe023a](https://github.com/Moritz344/bob-the-fisherman/commit/abe023aeb54f2ea2cbaad0d5cc60e79608ccf5a9))
* add depositLoot function => to deposit loot in a chest ([267bfa9](https://github.com/Moritz344/bob-the-fisherman/commit/267bfa9849153bfd677530bcc3651bd1d274e436))
