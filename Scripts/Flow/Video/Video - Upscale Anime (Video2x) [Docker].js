/**
 * @description Upscales anime using Video2x inside a docker container. Requires TempPathHost environment variable to be set if running inside a docker container
 * @author reven | Kamba
 * @uid ebbea155-596c-4be9-93bf-24858f6b0765
 * @revision 6
 * @param {int} UpscalingFactor The upscaling factor. If set to 4 it means any input file is upscaled to 4K
 * @param {int} Processes The number of processes to use, if in doubt, set this to 1]
 * @param {('waifu2x_caffe'|'waifu2x_converter_cpp'|'waifu2x_ncnn_vulkan'|'srmd_ncnn_vulkan'|'realsr_ncnn_vulkan'|'anime4kcpp')} Upscaler Select which Upscaler model to use (anime4kcpp might not work atm)
 * @output file was upscaled
 */
function Script(UpscalingFactor, Processes, Upscaler)
 {
    if(Processes < 1)
        Processes = 1;
    if(UpscalingFactor < 1)
        UpscalingFactor = 1;

    // copy the file into temporary directory
    let wf = Flow.CopyToTemp();
    let shortFile =  wf.substring(wf.lastIndexOf(Flow.IsWindows ? '\\' : '/') + 1);
    let output = Flow.NewGuid() + '.' + shortFile.substring(shortFile.lastIndexOf('.') + 1);
    let tempPath = Flow.TempPathHost;
    
    Logger.ILog('ShortFile: ' + shortFile);
    Logger.ILog('Output: ' + output);
    Logger.ILog('TempPath: ' + tempPath);

    let process = Flow.Execute({
        command: 'docker',
        argumentList: [
            'run',
            '--rm',
            '--privileged',
            '--gpus',
            'all',
            '-v',
            tempPath + ':/host',
            '-v',
            tempPath + ':/tmp',
            'k4yt3x/video2x:latest',
            '-i', '/host/' + shortFile,
            '-o', '/host/' + output,
            '-p', '' + Processes,
            '-r', '' + UpscalingFactor,
            '-d', Upscaler,
        ]
    });

    if(process.standardOutput)
        Logger.ILog('Standard output: ' + process.standardOutput);
    if(process.starndardError)
        Logger.ILog('Standard error: ' + process.starndardError);

    if(process.exitCode !== 0){
        Logger.ELog('Failed processing: ' + process.exitCode);
        return -1;
    }

    output = Flow.TempPath + '/' + output;
    Flow.SetWorkingFile(output);
    return 1;
 }
