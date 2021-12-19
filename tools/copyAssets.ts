import path from 'path';
import * as shell from 'shelljs';

// Copy all the view templates
shell.cp('-R', path.resolve('src/views'), path.resolve('dist/src'));
