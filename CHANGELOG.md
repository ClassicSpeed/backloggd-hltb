# Change Log

All notable changes to this project will be documented in this file.

## [1.3] - 2025-12-27

### Changed

- Updated to work on the latest version of backloggd.com
- No longer uses an HLTB Proxy, temporarily switched to data
  from [this source.](https://github.com/julianxhokaxhiu/hltb-scraper)
    - The data will be updated for a while until a new proxy is found.
- Removed "All" category (since it's not included in the new data).
- Clicking in a badge now opens a new tab with a HLTB search for the game.

## [1.2] - 2024-10-26

### Added

- You can now click on the badge to open the HLTB page for the game.
- You can also right-click on the badge to change the HLTB name used for the stats
- If the game is not found on HLTB, the badge will show a question mark.
    - You can click the "?" on the badge to enter the HLTB name manually.
    - This will be saved and used everytime you visit backloggd.

### Changed

- Fixed HLTB search not escaping strings correctly, resulting in wrong search results.
- Time badge is no longer removed when the game is not found on HLTB.

## [1.1] - 2024-08-10

### Changed

- Fixed extension not working on backloggd.com (without www)

## [1.0] - 2024-07-02

### Changed

- Fixed menu not working after restarting the browser

## [0.8] - 2024-07-02

### Changed

- Fixed extension enable option not disable the extension correctly

## [0.7] - 2024-07-02

### Added

- Option in extension context menu (right-click on the extension icon) to change the badge position

## [0.6] - 2024-05-28

### Changed

- Fixed extension menu not working on Firefox

## [0.5] - 2024-05-05

### Added

- Added time badges to other covers (like search items and a game's main page)

## [0.4] - 2024-02-11

### Added

- Added cache to improve the response time.

### Changed

- Improved page changing detection.
- Now the badge load first and then the time gets added, so the user gets a less jarring transition.

## [0.3] - 2024-02-07

### Added

- Firefox version released
- Option in extension context menu (right-click on the extension icon) to:
    - Enable/Disable the extension
    - Select the preferred time to show (main, completionist, etc.)

## [0.2] - 2024-02-05

### Added

- Chrome version released

## [0.1] - 2024-02-02

### Added

- Initial experimental version



