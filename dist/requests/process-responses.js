/**
 * Processing of custom types from `paths` section
 * in the schema
 */
import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { processProperty } from '../common';
import * as conf from '../conf';
import { createExport, processDefinition } from '../definitions';
/**
 * Process all responses of one method
 * @param httpResponse response object
 * @param name of the context for type name uniqueness
 * @param config global config
 */
export function processResponses(httpResponse, name, config) {
    const responses = _.filter(httpResponse, (r, status) => (r.schema && Math.floor(Number(status) / 100) === 2));
    let properties = [];
    for (const response of responses) {
        if (response.schema && response.schema.properties) {
            const processedDefinition = processNestedSchemaDefinition(response.schema, name, config);
            const propertyOutput = {
                property: `__model.${processedDefinition.name}`,
                propertyAsMethodParameter: '',
                enumDeclaration: undefined,
                native: false,
                isRequired: false,
            };
            properties.push(propertyOutput);
        }
        else {
            properties = properties.concat(processProperty(response.schema, undefined, name));
        }
    }
    const property = _.map(properties, 'property');
    const enumDeclaration = _.map(properties, 'enumDeclaration').filter(Boolean).join('\n\n');
    const usesGlobalType = properties.some(p => !p.native);
    let type;
    if (property.length) {
        type = _.uniqWith(property, _.isEqual).join(' | ');
    }
    else {
        type = 'void';
    }
    return { type, enumDeclaration, usesGlobalType };
}
function processNestedSchemaDefinition(schema, name, config) {
    const processedDef = processDefinition(schema, `${name}GeneratedInlineModel`, config);
    const filename = path.join(config.dest, `${conf.modelFile}.ts`);
    const exportDefiniton = createExport(processedDef.name);
    fs.appendFileSync(filename, `${exportDefiniton}\n`);
    return processedDef;
}
//# sourceMappingURL=process-responses.js.map