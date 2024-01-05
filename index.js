"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var simple_git_1 = __importDefault(require("simple-git"));
var fs_1 = __importDefault(require("fs"));
var core = __importStar(require("@actions/core"));
var github = __importStar(require("@actions/github"));
var process_1 = __importDefault(require("process"));
var generateChangelog_1 = require("./generateChangelog");
var repoPath = './'; // Replace with the path to your Git repository
// Get the current branch from the GITHUB_REF environment variable
var currentBranch = process_1.default.env.GITHUB_REF;
// Get the default branch from the github context
var defaultBranch = (_a = github.context.payload.repository) === null || _a === void 0 ? void 0 : _a.default_branch;
var changelog = '';
// Check if the current branch exists
if (currentBranch) {
    currentBranch = currentBranch.replace('refs/heads/', '');
}
else {
    core.setFailed('Could not determine the current branch');
}
if (!defaultBranch) {
    core.setFailed('Could not determine the default branch');
}
// Check if the repository exists
if (!fs_1.default.existsSync(repoPath)) {
    core.setFailed('Repository does not exist');
}
// Get the default branch from the github context
if (!defaultBranch) {
    core.setFailed('Could not determine the default branch');
}
// Check if the repository exists
if (!fs_1.default.existsSync(repoPath)) {
    console.error('The specified repository does not exist.');
    process_1.default.exit(1);
}
// @ts-ignore
var git = (0, simple_git_1.default)(repoPath);
git.log({ from: defaultBranch, to: currentBranch }, function (err, log) {
    if (err) {
        console.error(err);
        return;
    }
    var commits = log.all;
    // Process commits and generate Markdown
    changelog = (0, generateChangelog_1.generateChangelog)(commits);
});
// Set the CHANGELOG environment variable
core.exportVariable('CHANGELOG', changelog);
