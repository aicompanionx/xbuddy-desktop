import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * X Platform Auto Reply Tool Node.js Example
 * 
 * Usage:
 * node example.js [options]
 * 
 * Supported options:
 * --url=<url>          URL of the post to reply to
 * --comment=<text>     Reply content
 * --urls=<url1,url2>   Multiple URLs to reply to, separated by commas
 * --comments=<c1,c2>   Multiple reply contents, separated by commas
 * --repeat=<number>    Number of executions
 * --lang=<zh|en>       Interface language (Chinese or English)
 * --fast               Fast mode
 * --debug              Debug mode
 */

// Define options interface
interface AutoReplyOptions {
    url?: string;
    comment?: string;
    urls?: string;
    comments?: string;
    repeat?: string | number;
    lang?: string;
    fast?: boolean;
    debug?: boolean;
    [key: string]: string | number | boolean | undefined;
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: AutoReplyOptions = {};

args.forEach((arg: string) => {
    if (arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        options[key] = value || true;
    }
});

// Executable file path
const executablePath = (() => {
    // Check different possible paths
    const possiblePaths = [
        // Paths relative to current directory
        path.join(__dirname, 'dist', 'x_auto_reply', 'x_auto_reply'),
        path.join(__dirname, 'dist', 'x_auto_reply', 'x_auto_reply.exe'),
        // Direct Python usage
        'python',
        'python3'
    ];

    for (const exePath of possiblePaths) {
        if (exePath === 'python' || exePath === 'python3') return exePath;

        try {
            if (fs.existsSync(exePath)) {
                return exePath;
            }
        } catch (err) {
            // Ignore errors, continue trying other paths
        }
    }

    // Default to python as fallback option
    return 'python';
})();

// Build command line arguments
const buildCommandArgs = (): string[] => {
    const cmdArgs: string[] = [];

    // If using Python instead of packaged executable, add script path
    if (executablePath === 'python' || executablePath === 'python3') {
        cmdArgs.push('index.py');
    }

    // Add URL parameter
    if (options.url) {
        cmdArgs.push('--url', options.url);
    }

    // Add comment parameter
    if (options.comment) {
        cmdArgs.push('--comment', options.comment);
    }

    // Add multiple URLs parameter
    if (options.urls) {
        options.urls.split(',').forEach((url: string) => {
            cmdArgs.push('--urls', url.trim());
        });
    }

    // Add multiple comments parameter
    if (options.comments) {
        options.comments.split(',').forEach((comment: string) => {
            cmdArgs.push('--comments', comment.trim());
        });
    }

    // Add repeat count parameter
    if (options.repeat) {
        cmdArgs.push('--repeat', String(options.repeat));
    }

    // Add language parameter
    if (options.lang) {
        cmdArgs.push('--lang', options.lang);
    }

    // Add fast mode parameter
    if (options.fast) {
        cmdArgs.push('--fast');
    }

    // Add debug mode parameter
    if (options.debug) {
        cmdArgs.push('--debug');
    }

    return cmdArgs;
};

// Set default values
if (!options.url && !options.urls) {
    options.url = 'https://x.com/elonmusk';
}

if (!options.comment && !options.comments) {
    options.comment = 'Thanks for sharing!';
}

// Print start information
console.log('Starting X Auto Reply Tool');
console.log(`Using executable: ${executablePath}`);
console.log('Parameters:', options);

// Build command line arguments
const cmdArgs = buildCommandArgs();
console.log('Command line arguments:', cmdArgs);

// Execute program
const childProcess = spawn(executablePath, cmdArgs);

// Handle output
childProcess.stdout.on('data', (data: Buffer) => {
    try {
        // Try to parse JSON output
        const messages = data.toString().trim().split('\n');

        for (const message of messages) {
            if (!message) continue;

            try {
                const parsedData = JSON.parse(message);
                const timestamp = new Date(parsedData.timestamp * 1000).toLocaleTimeString();
                const level = parsedData.level.toUpperCase();
                console.log(`[${timestamp}] [${level}] ${parsedData.message}`);
            } catch (e) {
                // Non-JSON format, output directly
                console.log(`[OUTPUT] ${message}`);
            }
        }
    } catch (e) {
        // Output raw data directly
        console.log(`[OUTPUT] ${data}`);
    }
});

// Handle errors
childProcess.stderr.on('data', (data: Buffer) => {
    console.error(`[ERROR] ${data}`);
});

// Program end
childProcess.on('close', (code: number | null) => {
    console.log(`Program execution completed, exit code: ${code}`);
});

// Handle process termination
childProcess.on('error', (err: Error) => {
    console.error('Execution failed:', err);
});

// Allow users to terminate the program with Ctrl+C
process.on('SIGINT', () => {
    console.log('Termination signal received, shutting down...');
    if (childProcess && !childProcess.killed) {
        childProcess.kill();
    }
    process.exit(0);
}); 