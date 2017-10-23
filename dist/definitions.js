"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Processing of custom types from `definitions` section
 * in the schema
 */
const _ = require("lodash");
const path = require("path");
const common_1 = require("./common");
const conf = require("./conf");
const utils_1 = require("./utils");
/**
 * Entry point, processes all definitions and exports them
 * to individual files
 * @param defs definitions from the schema
 */
function processDefinitions(defs, header) {
    utils_1.emptyDir(path.join(conf.outDir, conf.defsDir));
    const files = {};
    _.forOwn(defs, (v, source) => {
        const file = processDefinition(v, source, header);
        if (file) {
            const previous = files[file];
            if (previous === undefined) {
                files[file] = [source];
            }
            else {
                previous.push(source);
            }
        }
    });
    let allExports = '';
    _.forOwn(files, (sources, def) => {
        allExports += createExport(def) + createExportComments(def, sources) + '\n';
    });
    const filename = path.join(conf.outDir, `${conf.modelFile}.ts`);
    utils_1.writeFile(filename, allExports, header);
}
exports.processDefinitions = processDefinitions;
/**
 * Creates the file of the type definition
 * @param def type definition
 * @param name name of the type definition and after normalization of the resulting interface + file
 */
function processDefinition(def, name, header) {
    if (!isWritable(name)) {
        return;
    }
    name = common_1.normalizeDef(name);
    let output = '';
    const properties = _.map(def.properties, (v, k) => common_1.processProperty(v, k, name, def.required));
    // conditional import of global types
    if (properties.some(p => !p.native)) {
        output += `import * as ${conf.modelFile} from \'../${conf.modelFile}\';\n\n`;
    }
    if (def.description) {
        output += `/** ${def.description} */\n`;
    }
    output += `export interface ${name} {\n`;
    output += utils_1.indent(_.map(properties, 'property').join('\n'));
    output += `\n}\n`;
    // concat non-empty enum lines
    const enumLines = _.map(properties, 'enumDeclaration').filter(Boolean).join('\n\n');
    if (enumLines) {
        output += `\n${enumLines}\n`;
    }
    const filename = path.join(conf.outDir, conf.defsDir, `${name}.ts`);
    utils_1.writeFile(filename, output, header);
    return name;
}
/**
 * Creates single export line for `def` name
 * @param def name of the definition file w/o extension
 */
function createExport(def) {
    return `export * from './${conf.defsDir}/${def}';`;
}
/**
 * Creates comment naming source definitions for the export
 * @param def name of the definition file w/o extension
 * @param sources list of sources for the file
 */
function createExportComments(file, sources) {
    if (sources.length > 1 || sources.indexOf(file) === -1) {
        return ' // sources: ' + sources.join(', ');
    }
    return '';
}
/**
 * Checks whether this type's file shall be serialized
 * @param type name
 */
function isWritable(type) {
    if (type.startsWith('Collection«')) {
        return false;
    }
    return true;
}
//# sourceMappingURL=definitions.js.map