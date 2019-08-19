import * as _ from 'lodash';
import * as path from 'path';
import { stateDir } from '../../conf';
import { indent, writeFile } from '../../utils';
export function generateHttpActions(config, name, responseDef, actionClassNameBase, simpleName, formSubDirName, paramGroups) {
    let content = '';
    const hasParams = paramGroups.length >= 1;
    content += getActionImports(name, simpleName, hasParams, responseDef.type.startsWith('__model.'));
    content += getActionTypes(name, simpleName);
    content += getActionStartDefinition(simpleName, hasParams);
    content += getActionSuccessDefinition(responseDef);
    content += getActionErrorDefinition();
    content += getActionOverviewType(actionClassNameBase);
    const actionsFileName = path.join(formSubDirName, stateDir, `actions.ts`);
    writeFile(actionsFileName, content, config.header, 'ts', ['max-line-length', 'max-classes-per-file']);
}
function getActionImports(name, simpleName, hasParams, importModels) {
    let res = `import {HttpErrorResponse} from '@angular/common/http';\n`;
    res += `import {Action} from '@ngrx/store';\n`;
    if (hasParams) {
        res += `import {${_.upperFirst(simpleName)}Params} from '../../../../controllers/${name}';\n`;
    }
    if (importModels) {
        res += `import * as __model from '../../../../model';\n`;
    }
    else {
        res += `import * as __model from '../../../../model';\n`;
    }
    res += `\n`;
    return res;
}
function getActionTypes(controllerName, methodName) {
    let res = `export enum Actions {\n`;
    res += indent([
        `START = '[${controllerName} ${methodName}] Start',`,
        `SUCCESS = '[${controllerName} ${methodName}] Success',`,
        `ERROR = '[${controllerName} ${methodName}] Error',`,
    ]);
    res += `\n}\n\n`;
    return res;
}
function getActionStartDefinition(name, hasParams) {
    let res = `export class Start implements Action {\n`;
    res += indent(`readonly type = Actions.START;\n`);
    const params = hasParams ? `public payload: ${_.upperFirst(name)}Params` : '';
    res += indent(`constructor(${params}) {}\n`);
    res += `}\n`;
    res += `\n`;
    return res;
}
function getActionSuccessDefinition(response) {
    let res = `export class Success implements Action {\n`;
    res += indent(`readonly type = Actions.SUCCESS;\n`);
    res += indent(`constructor(public payload: ${response.type}) {}\n`);
    res += `}\n`;
    res += `\n`;
    return res;
}
function getActionErrorDefinition() {
    let res = `export class Error implements Action {\n`;
    res += indent(`readonly type = Actions.ERROR;\n`);
    res += indent(`constructor(public payload: HttpErrorResponse) {}\n`);
    res += `}\n`;
    res += `\n`;
    return res;
}
function getActionOverviewType(actionClassNameBase) {
    return `export type ${actionClassNameBase}Action = Start | Success | Error;\n`;
}
export function getActionClassNameBase(name) {
    return getClassName(name);
}
export function getClassName(name) {
    return _.upperFirst(name);
}
//# sourceMappingURL=generate-http-actions.js.map