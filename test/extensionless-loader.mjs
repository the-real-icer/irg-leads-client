// Node ESM loader hooks must be named exports.
// eslint-disable-next-line import/prefer-default-export
export async function resolve(specifier, context, nextResolve) {
    try {
        return await nextResolve(specifier, context);
    } catch (error) {
        const isRelative = specifier.startsWith('.') || specifier.startsWith('/');
        const hasJsExtension = /\.[cm]?js$/.test(specifier);

        if (error && error.code === 'ERR_MODULE_NOT_FOUND' && isRelative && !hasJsExtension) {
            return nextResolve(`${specifier}.js`, context);
        }

        throw error;
    }
}
