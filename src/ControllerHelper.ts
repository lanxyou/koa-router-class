import * as fs from 'fs';
import * as path from 'path';

import { ControllerMatch, requireDefault } from './utils';
import { IControllerInfo, IHelper, IMethodInfo } from './type';
import log from './log';

// ControllerMap
export const ControllerMap: Map<Function, IControllerInfo> = new Map();

/**
 * methodType 是否一致
 * @param clazz class
 * @param methodName method
 * @param methodType type
 */
export function MergeMethodType(clazz: Function, methodName: string, methodType: string) {
    const { methodMap } = ControllerMap.get(clazz);
    if (!methodMap) return true;

    const methodInfo = methodMap.get(methodName);
    if (!methodInfo) return true;

    const { methodTypes } = methodInfo;
    if (!methodTypes || methodTypes.length === 0) return true;

    return methodTypes.indexOf(methodType) > -1;
}

export function LoadControllers(dirPath: string) {
    console.assert(fs.existsSync(dirPath), `controller file path is not exists, path:${dirPath}`);

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        log('controller', file);
        const filePath = path.resolve(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            LoadControllers(filePath);
        } else {
            const controllerResult = ControllerMatch(filePath);
            if (!controllerResult) return;

            const clazzName = controllerResult[1].toLowerCase();

            const clazz = requireDefault(filePath);
            SetController(clazz, null, { clazzName });
        }
    }
}

export function SetController(clazz: Function, methodName: string, info: IHelper = {}) {
    const clazzInfo: IControllerInfo = ControllerMap.get(clazz) || {};

    const { rootPath, clazzName, path: mpath, inside, methodType, before, after } = info;
    if (clazzName) clazzInfo.clazzName = clazzName;
    if (rootPath) clazzInfo.rootPath = rootPath;
    if (before) clazzInfo.before = before;
    if (after) clazzInfo.after = after;

    if (methodName) {
        const { methodMap = new Map() } = clazzInfo;
        const methodInfo: IMethodInfo = methodMap.get(methodName) || {};
        methodInfo.inside = inside || false;
        if (mpath) methodInfo.path = mpath;
        const { methodTypes = [] } = methodInfo;
        if (methodType) methodTypes.push(methodType);
        methodInfo.methodTypes = methodTypes;

        methodMap.set(methodName, methodInfo);
        clazzInfo.methodMap = methodMap;
    }

    ControllerMap.set(clazz, clazzInfo);
}

export function Private(target: any, methodName: string) {
    SetController(target.constructor, methodName, { inside: true });
}

export const controllers: any = new Proxy({}, {
    get(_, clazzName: string) {
        return new Proxy({}, {
            get(__, methodName: string) {
                if (typeof methodName !== 'string') return {};
                return `/${clazzName}/${methodName}`;
            },
        });
    },
});
