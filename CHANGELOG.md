# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.1]

### Changed

- Create Alternate File now correctly handles creating new directories

## [0.3.0]

## Added

- `Initialize Projections File` command

## Changed

- Renamed `Split Alternate File` to `Alternate File in Split` for easier Command Pallet searching
- Split engine into NPM lib for easier extension

## [0.2.0]

### Added

- Support finding .projections.json in places other than the workspace.
- Support multiple dirname parts

### Changed

- Refactored and increased test coverage
- Better error messages when trying to run a command without a `.projections.json`

## [0.1.0]

### Added

- Watch .projections.json for changes

### Changed

- Rename "alternates" array to "alternate"
- Better error messages

## [0.0.1]

### Added

- Support switching to and creating alternative files
