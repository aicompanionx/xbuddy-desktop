const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 配置项
const config = {
  language: process.env.LANG?.includes('zh') ? 'zh' : 'en', // 默认根据系统语言选择
  fastMode: false,
  debug: false
};

// 处理命令行参数
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--zh' || arg === '--lang=zh') {
    config.language = 'zh';
  } else if (arg === '--en' || arg === '--lang=en') {
    config.language = 'en';
  } else if (arg === '--fast' || arg === '--fast-mode') {
    config.fastMode = true;
  } else if (arg === '--debug') {
    config.debug = true;
  }
}

// 记录启动时间
const startTime = new Date();
console.log(`${config.language === 'zh' ? '启动时间' : 'Start Time'}: ${startTime.toLocaleString()}`);

// 获取可执行文件的绝对路径
const executablePath = path.join(__dirname, 'dist', 'x_auto_reply');

// 确保可执行文件存在
if (!fs.existsSync(executablePath)) {
  console.error(config.language === 'zh' ? '错误：可执行文件未找到，请先构建项目' : 'Error: Executable not found, please build the project first');
  process.exit(1);
}

// 确保可执行文件有执行权限（对于macOS和Linux系统）
if (process.platform !== 'win32') {
  try {
    fs.chmodSync(executablePath, '755');
    console.log(config.language === 'zh' ? '已为可执行文件设置执行权限' : 'Executable permission set');
  } catch (error) {
    console.error(config.language === 'zh' ? `设置执行权限失败: ${error.message}` : `Failed to set permissions: ${error.message}`);
    process.exit(1);
  }
}

// 准备Python脚本参数
const pythonArgs = [];

// 添加语言参数
pythonArgs.push(`--lang=${config.language}`);

// 添加性能优化参数
if (config.fastMode) {
  pythonArgs.push('--fast');
  console.log(config.language === 'zh' ? '启用快速模式' : 'Fast mode enabled');
}

if (config.debug) {
  pythonArgs.push('--debug');
  console.log(config.language === 'zh' ? '启用调试模式' : 'Debug mode enabled');
}

// 添加用户传入的其他参数（URL、评论等）
for (const arg of args) {
  // 跳过已处理的特殊参数
  if (!arg.startsWith('--lang=') && 
      arg !== '--zh' && 
      arg !== '--en' && 
      arg !== '--fast' && 
      arg !== '--fast-mode' && 
      arg !== '--debug') {
    pythonArgs.push(arg);
  }
}

// 设置环境变量
const env = {
  ...process.env,
  PYTHONUNBUFFERED: '1', // 确保Python输出不缓冲
  LANG: config.language === 'zh' ? 'zh_CN.UTF-8' : 'en_US.UTF-8'
};

console.log(config.language === 'zh' ? `正在启动 x_auto_reply...` : `Starting x_auto_reply...`);
if (pythonArgs.length > 0) {
  console.log(config.language === 'zh' ? `参数: ${pythonArgs.join(' ')}` : `Arguments: ${pythonArgs.join(' ')}`);
}

// 使用spawn来调用可执行文件
const childProcess = spawn(executablePath, pythonArgs, {
  env,
  stdio: 'inherit' // 将子进程的标准输入输出错误流直接连接到父进程
});

// 处理子进程事件
childProcess.on('error', (error) => {
  console.error(config.language === 'zh' ? `启动失败: ${error.message}` : `Failed to start: ${error.message}`);
  recordEndTime();
});

childProcess.on('close', (code) => {
  if (code === 0) {
    console.log(config.language === 'zh' ? `进程已成功退出` : `Process exited successfully`);
  } else {
    console.log(config.language === 'zh' ? `进程已退出，退出码: ${code}` : `Process exited with code: ${code}`);
  }
  recordEndTime();
});

// 处理当前进程的终止信号，确保子进程也能正确终止
process.on('SIGINT', () => {
  console.log(config.language === 'zh' ? '\n接收到终止信号，正在关闭...' : '\nReceived terminate signal, shutting down...');
  childProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  childProcess.kill('SIGTERM');
});

// 记录结束时间并计算运行时间
function recordEndTime() {
  const endTime = new Date();
  const runTime = (endTime - startTime) / 1000; // 转换为秒
  console.log(config.language === 'zh' 
    ? `结束时间: ${endTime.toLocaleString()}`
    : `End Time: ${endTime.toLocaleString()}`);
  console.log(config.language === 'zh'
    ? `总运行时间: ${runTime.toFixed(2)}秒` 
    : `Total execution time: ${runTime.toFixed(2)} seconds`);
} 