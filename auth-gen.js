const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const generateOpenssl = () => {
    // 랜덤 바이트 생성 및 base64 인코딩
    const randomBytes = new Uint8Array(44);
    crypto.getRandomValues(randomBytes);
    const byteArray = Array.from(randomBytes);
    const base64String = btoa(String.fromCharCode(...byteArray));
    
    console.log("생성된 NEXTAUTH_SECRET:", base64String);
    
    // .env 파일 경로 설정 (apps/web 디렉토리)
    const envPath = path.join(__dirname, ".env");
    
    try {
        let envContent = "";
        
        // 기존 .env 파일이 있는지 확인
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, "utf8");
            console.log("기존 .env 파일을 찾았습니다.");
            
            // NEXTAUTH_SECRET 라인이 있는지 확인
            const lines = envContent.split("\n");
            let secretExists = false;
            
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith("NEXTAUTH_SECRET=")) {
                    lines[i] = `NEXTAUTH_SECRET=${base64String}`;
                    secretExists = true;
                    console.log("기존 NEXTAUTH_SECRET을 업데이트했습니다.");
                    break;
                }
            }
            
            if (!secretExists) {
                lines.push(`NEXTAUTH_SECRET=${base64String}`);
                console.log("새로운 NEXTAUTH_SECRET을 추가했습니다.");
            }
            
            envContent = lines.join("\n");
        } else {
            // .env 파일이 없으면 새로 생성
            envContent = `NEXTAUTH_SECRET=${base64String}\n`;
            console.log("새로운 .env 파일을 생성했습니다.");
        }
        
        // .env 파일에 저장
        fs.writeFileSync(envPath, envContent);
        console.log(`✅ NEXTAUTH_SECRET이 ${envPath}에 성공적으로 저장되었습니다.`);
        
    } catch (error) {
        console.error("❌ .env 파일 처리 중 오류가 발생했습니다:", error.message);
    }
};

generateOpenssl();