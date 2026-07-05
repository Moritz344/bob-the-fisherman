# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
