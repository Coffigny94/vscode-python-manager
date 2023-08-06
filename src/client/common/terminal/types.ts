// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import { CancellationToken, Event, Terminal, Uri } from 'vscode';
import { PythonEnvironment } from '../../pythonEnvironments/info';
import { IDisposable, Resource } from '../types';

export enum TerminalActivationProviders {
    bashCShellFish = 'bashCShellFish',
    commandPromptAndPowerShell = 'commandPromptAndPowerShell',
    nushell = 'nushell',
    pyenv = 'pyenv',
    conda = 'conda',
    pipenv = 'pipenv',
}
export enum TerminalShellType {
    powershell = 'powershell',
    powershellCore = 'powershellCore',
    commandPrompt = 'commandPrompt',
    gitbash = 'gitbash',
    bash = 'bash',
    zsh = 'zsh',
    ksh = 'ksh',
    fish = 'fish',
    cshell = 'cshell',
    tcshell = 'tshell',
    nushell = 'nushell',
    wsl = 'wsl',
    xonsh = 'xonsh',
    other = 'other',
}

export interface ITerminalService extends IDisposable {
    readonly onDidCloseTerminal: Event<void>;
    /**
     * Sends a command to the terminal.
     *
     * @param {string} command
     * @param {string[]} args
     * @param {CancellationToken} [cancel] If provided, then wait till the command is executed in the terminal.
     * @param {boolean} [swallowExceptions] Whether to swallow exceptions raised as a result of the execution of the command. Defaults to `true`.
     * @returns {Promise<void>}
     * @memberof ITerminalService
     */
    sendCommand(
        command: string,
        args: string[],
        cancel?: CancellationToken,
        swallowExceptions?: boolean,
    ): Promise<void>;
    sendText(text: string): Promise<void>;
    show(preserveFocus?: boolean): Promise<void>;
}

export const ITerminalServiceFactory = Symbol('ITerminalServiceFactory');

export type TerminalCreationOptions = {
    /**
     * Object with environment variables that will be added to the Terminal.
     */
    env?: { [key: string]: string | null };
    /**
     * Resource identifier. E.g. used to determine python interpreter that needs to be used or environment variables or the like.
     *
     * @type {Uri}
     */
    resource?: Uri;
    /**
     * Title.
     *
     * @type {string}
     */
    title?: string;
    /**
     * Associated Python Interpreter.
     *
     * @type {PythonEnvironment}
     */
    interpreter?: PythonEnvironment;
    /**
     * Whether hidden.
     *
     * @type {boolean}
     */
    hideFromUser?: boolean;
};

export interface ITerminalServiceFactory {
    /**
     * Gets a terminal service.
     * If one exists with the same information, that is returned else a new one is created.
     *
     * @param {TerminalCreationOptions}
     * @returns {ITerminalService}
     * @memberof ITerminalServiceFactory
     */
    getTerminalService(options: TerminalCreationOptions & { newTerminalPerFile?: boolean }): ITerminalService;
    createTerminalService(resource?: Uri, title?: string): ITerminalService;
}

export const ITerminalHelper = Symbol('ITerminalHelper');

export interface ITerminalHelper {
    createTerminal(title?: string): Terminal;
    identifyTerminalShell(terminal?: Terminal): TerminalShellType;
    buildCommandForTerminal(terminalShellType: TerminalShellType, command: string, args: string[]): string;
    getEnvironmentActivationCommands(
        terminalShellType: TerminalShellType,
        resource?: Uri,
        interpreter?: PythonEnvironment,
    ): Promise<string[] | undefined>;
    getEnvironmentActivationShellCommands(
        resource: Resource,
        shell: TerminalShellType,
        interpreter?: PythonEnvironment,
    ): Promise<string[] | undefined>;
}

export const ITerminalActivator = Symbol('ITerminalActivator');
export type TerminalActivationOptions = {
    resource?: Resource;
    preserveFocus?: boolean;
    interpreter?: PythonEnvironment;
    /**
     * When sending commands to the terminal, do not display the terminal.
     *
     * @type {boolean}
     */
    hideFromUser?: boolean;
};
export interface ITerminalActivator {
    activateEnvironmentInTerminal(terminal: Terminal, options?: TerminalActivationOptions): Promise<boolean>;
}

export const ITerminalActivationCommandProvider = Symbol('ITerminalActivationCommandProvider');

export interface ITerminalActivationCommandProvider {
    isShellSupported(targetShell: TerminalShellType): boolean;
    getActivationCommands(resource: Uri | undefined, targetShell: TerminalShellType): Promise<string[] | undefined>;
    getActivationCommandsForInterpreter(
        pythonPath: string,
        targetShell: TerminalShellType,
    ): Promise<string[] | undefined>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ShellIdentificationTelemetry = any;

export const IShellDetector = Symbol('IShellDetector');
/**
 * Used to identify a shell.
 * Each implemenetion will provide a unique way of identifying the shell.
 *
 * @export
 * @interface IShellDetector
 */
export interface IShellDetector {
    /**
     * Classes with higher priorities will be used first when identifying the shell.
     *
     * @type {number}
     * @memberof IShellDetector
     */
    readonly priority: number;
    identify(telemetryProperties: ShellIdentificationTelemetry, terminal?: Terminal): TerminalShellType | undefined;
}
