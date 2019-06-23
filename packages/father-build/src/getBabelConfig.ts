import { winPath } from './utils';

interface IGetBabelConfigOpts {
  target: 'browser' | 'node';
  type?: 'esm' | 'cjs';
  typescript: boolean;
  runtimeHelpers?: boolean;
  filePath?: string;
  browserFiles?: {
    [value: string]: any;
  };
  nodeFiles?: {
    [value: string]: any;
  };
}

export default function(opts: IGetBabelConfigOpts) {
  const { target, typescript, type, runtimeHelpers, filePath, browserFiles, nodeFiles } = opts;
  let isBrowser = target === 'browser';
  // rollup 场景下不会传入 filePath
  if (filePath) {
    // 转化一下，如果是 win 会报错
    let realPath = winPath(filePath);
    if (isBrowser) {
      if (nodeFiles.includes(realPath)) isBrowser = false;
    } else {
      if (browserFiles.includes(realPath)) isBrowser = true;
    }
  }
  const targets = isBrowser ? { browsers: ['last 2 versions', 'IE 10'] } : { node: 6 };

  return {
    presets: [
      ...(typescript ? [require.resolve('@babel/preset-typescript')] : []),
      [require.resolve('@babel/preset-env'), { targets, modules: type === 'esm' ? false : 'auto' }],
      ...(isBrowser ? [require.resolve('@babel/preset-react')] : []),
    ],
    plugins: [
      require.resolve('babel-plugin-react-require'),
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-export-namespace-from'),
      require.resolve('@babel/plugin-proposal-do-expressions'),
      [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
      [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
      ...(runtimeHelpers
        ? [[require.resolve('@babel/plugin-transform-runtime'), { useESModules: true }]]
        : []),
    ],
  };
}
