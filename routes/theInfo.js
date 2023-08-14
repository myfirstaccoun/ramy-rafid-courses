const express = require("express");
const router = express.Router();
let دورة = "";
let fs = require('fs');
let path = require('path');
let coursesPath = path.join(__dirname, `../public`);
let coursesFilesPath;
let playlistID = [];
let namesFiles = [];
let startVideoInArr = [];
let isTests = [];
let isError = [];
let reload = 0; // is page reloaded

let courses = [];
fs.readdir(coursesPath, (err, folders) => {
    for(let i = 0; i < folders.length; i++) {
        let str = folders[i];
        if(str != "صور") {
            courses.push(str.trim());
            
            coursesFilesPath = path.join(__dirname, `../public/${folders[i]}/الرابط.txt`);
            fs.readFile(coursesFilesPath, "utf8", (err, data) => {
                startVideoInArr.push(data.split("\r\n").length > 1? parseInt(data.split("\r\n")[1]) : 0);
                data.split("\r\n").length > 2 && data.split("\r\n")[2] != ""? namesFiles.push([folders[i], 0]) : namesFiles.push([folders[i], 1]);
                playlistID.push([folders[i], data.split("\r\n")[0]]);
            });
        }
    }
});

function right(str, chr) {
    return str.slice(str.length-chr,str.length);
}

function check2Ds(arr1D, arr2D, i, ires) { // 1D=[1,2,3], 2D=[ [10,1], [20,1], [30,2], [40,2] ], i=1, ires=0 ==> [ [1, [10,20]], [2, [30, 40]], [3, []] ] ]
    let final = [];
    for(let d = 0; d < arr1D.length; d++) {
        let tmp = [];
        for(let e = 0; e < arr2D.length; e++) {
            if(arr2D[e][i] != undefined) {
                arr2D[e][i].trim() == arr1D[d].trim()? tmp.push(arr2D[e][ires]) : "";
            }
        }
        final.push([arr1D[d], tmp]);
    }

    return final;
}

function search2D(arr, item, column_search = 0, column_result = 1) {
    let res = [];
    let i = 0;
    while(i < arr.length) {
        if(arr[i][column_search] == item)
            res.push(arr[i][column_result]);
        i++;
    }

    return res;
}

router.get("/", (req, res) => {
    res.redirect("/all-courses");
});

router.get("/all-courses", (req, res) => {
    res.render("courses", {courses: courses, playlistID: playlistID, namesFiles: namesFiles});
});

router.get("/all-courses/:id", (req, res) => {
    isTests = [];
    دورة != ""? reload = (دورة == req.params.id? 1 : 0) : "";

    دورة = req.params.id;
    isError = [];
    
    let courseInterval = setInterval(() => {
    if(دورة == req.params.id) {
    let voicePath = path.join(__dirname, `../public/${دورة}/صوت`);
    let pdfPath = path.join(__dirname, `../public/${دورة}/تفريغ وتشجير`);
    let filesPath = path.join(__dirname, `../public/${دورة}`);
    let a = "";

    // tmp vars, cont ==> continue
    let contTests = 0;
    let cont = [["names", 0], ["pdf", 0], ["tests", 0]];

    // names
    let names = [];
    fs.readdir(voicePath, (err, files) => {
        a = files;
        if(files != undefined) {
            for(let i = 0; i < files.length; i++) {
                let str = files[i];
                str = right(str, str.length-5).split(".")[0];
                names.push(str.trim());
            }
        } else {isError.push(1);}

        cont[0][1] = 1;
    });

    // pdf
    let pdf = [];
    fs.readdir(pdfPath, (err, files) => {
        if(files != undefined) {
            for(let i = 0; i < files.length; i++) {
                let str = files[i];
                str = right(str, str.length-5).split(".")[0].split(" - ");
                str != "op"? pdf.push(str) : "";
            }
        } else {isError.push(2);}

        cont[1][1] = 1;
    });
    
    let waitInterval = setInterval(() => {
        if(cont[0][1] == 1 && cont[1][1] == 1) {
            if(namesFiles[courses.indexOf(دورة)] == 0) {
                names = [];
                pdf = [];
                isError = 0;
            }

            clearInterval(waitInterval);
        }
    })
    
    

    let contIsTests = 0;

    // isTest
    let isTestInterval = setInterval(() => {
        if(دورة == req.params.id) {
            fs.readdir(filesPath, (err, files) => {
                if(files != undefined) {
                    for(let i = 0; i < files.length; i++) {
                        let str = files[i];
                        if(str.split(".txt")[0] == "اختبارات") {
                            isTests.push(1);
                        }
                    }
                } else {isError.push(3);}

                contIsTests = 1;
                
            });

            clearInterval(isTestInterval);
        }
    });

    
    let tests = [];
    let theTestsInterval = setInterval(() => {
        if(contIsTests == 1 && cont[2][1] == 0 && دورة == req.params.id) {
            if(isTests.length > 0) {
                testsPath = path.join(__dirname, `../public/${دورة}/اختبارات.txt`);
                fs.readFile(testsPath, "utf8", (err, data) => {
                    let waitInterval = setInterval(() => {
                        if(data != undefined) {
                            for(let i = 0; i < data.split("\r\n").length; i++) {
                                let test = data.split("\r\n")[i];
                                tests.push([test.split("- ")[0], test.split("- ")[1]]);
                            }

                            contTests = 1;

                            clearInterval(waitInterval);
                        }
                    });
                });
            } else {contTests = 1;}

            cont[2][1] = 1;
            clearInterval(theTestsInterval);
        }
    });

    let lessonInfo = [];
    let testsInterval = setInterval(() => {
        if(contTests == 1) {
            lessonInfo = check2Ds(names, pdf, 1, 0);
            // lessonInfo ==> [الخ ... "اسم الدرس", ["تفريغ", "كتاب"]]
            // console.log([names[15], pdf[52][1]], names[15] == pdf[52][1]); // عند ظهور مشاكل في اختلاف التسمية - اسم الملف
            isError.length == 0? res.render("index", {fff: a, lesInfo: JSON.stringify(lessonInfo), course: دورة, courses: courses, playlistID: playlistID, startVideoIn: startVideoInArr, tests: tests, namesFiles: namesFiles, reload: reload}) : res.status(404).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>خطأ</title>
                <link data-default-icon="/public/صور/شعار.png" data-badged-icon="/public/صور/شعار.png" rel="shortcut icon" type="image/x-icon" href="/public/صور/شعار.png">
            </head>
            <body>
                <h1>هذه الدورة غير موجودة</h1>
            </body>
            <script>
                console.log("isError = [" + ${JSON.stringify(isError.sort((x, y) => x - y))} + "]");
                setTimeout(() => {
                    window.location.href = "/";
                }, 5000);
            </script>
            </html>
            `);

            clearInterval(testsInterval);
        }
    });

    clearInterval(courseInterval);
    }
    });
});

module.exports = router;