import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';

export async function installDependencies(projectPath: string, packageManager: string = 'pnpm') {
  const spinner = ora('📦 Installing dependencies...').start();
  
  try {
    const installCommand = getInstallCommand(packageManager);
    
    await execa(packageManager, installCommand, {
      cwd: projectPath,
      stdio: 'pipe',
    });
    
    spinner.succeed('✅ Dependencies installed successfully');
  } catch (error) {
    spinner.fail('❌ Failed to install dependencies');
    console.error(chalk.red('Installation failed. You may need to install manually:'));
    console.error(chalk.cyan(`cd ${projectPath} && ${packageManager} install`));
    throw error;
  }
}

function getInstallCommand(packageManager: string): string[] {
  switch (packageManager) {
    case 'yarn':
      return ['install'];
    case 'pnpm':
      return ['install'];
    case 'npm':
    default:
      return ['install'];
  }
}

export async function addDependencies(
  projectPath: string,
  dependencies: string[],
  packageManager: string = 'pnpm',
  dev: boolean = false
) {
  const spinner = ora(`📦 Adding ${dev ? 'dev ' : ''}dependencies...`).start();
  
  try {
    const addCommand = getAddCommand(packageManager, dev);
    
    await execa(packageManager, [...addCommand, ...dependencies], {
      cwd: projectPath,
      stdio: 'pipe',
    });
    
    spinner.succeed(`✅ ${dev ? 'Dev d' : 'D'}ependencies added successfully`);
  } catch (error) {
    spinner.fail(`❌ Failed to add ${dev ? 'dev ' : ''}dependencies`);
    throw error;
  }
}

function getAddCommand(packageManager: string, dev: boolean): string[] {
  switch (packageManager) {
    case 'yarn':
      return dev ? ['add', '--dev'] : ['add'];
    case 'pnpm':
      return dev ? ['add', '--save-dev'] : ['add'];
    case 'npm':
    default:
      return dev ? ['install', '--save-dev'] : ['install', '--save'];
  }
}
