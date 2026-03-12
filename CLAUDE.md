# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

n8n community node for Crypto APIs — blockchain infrastructure for 15+ protocols

## Tech Stack

Node.js (TypeScript)

## Commands

### Build

- `npm install` — install dependencies
- `npm run build` — build the project

### All npm scripts

- `npm run build` — `tsc && gulp build:icons`
- `npm run dev` — `tsc --watch`
- `npm run lint` — `tsc --noEmit`
- `npm run prepublishOnly` — `npm run build`

### Run

- `npm run dev` — start in development mode

### Lint

- `npm run lint` — run linter

## Architecture

Entry point: `dist/nodes/CryptoApis/CryptoApis.node.js`

