/***************************************************************************************************
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the MIT License. See LICENSE file in the project root for license information.
 **************************************************************************************************/

type CommandResult = {
    exitCode: number
    output: string
    error: string
};

export default CommandResult;
