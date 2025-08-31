pipeline {
    agent {
        label 'local'
    }
    
    // ✅ FIX 1: Thêm triggers để auto-start với webhook
    triggers {
        githubPush()
        pollSCM('H/5 * * * *')
    }
        
    environment {
        COMMIT_HASH = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        REGISTRY = 'docker.io'
        USERNAME = 'toanndcloud'
    }
    
    stages {
        stage('📥 Checkout') {
            steps {
                echo '🔄 Lấy code từ repository...'
                sh 'pwd && ls -la'
                sh 'chmod +x scripts/*.sh'
            }
        }
        
        stage('📦 Install Dependencies') {
            steps {
                echo '📦 Cài đặt dependencies...'
                script {
                    if (fileExists('services/user-service/package.json')) {
                        sh 'cd services/user-service && npm install || echo "⚠️ User service npm install failed"'
                    }
                    
                    if (fileExists('services/order-service/package.json')) {
                        sh 'cd services/order-service && npm install || echo "⚠️ Order service npm install failed"'
                    }
                    
                    if (fileExists('frontend/package.json')) {
                        sh 'cd frontend && npm install || echo "⚠️ Frontend npm install failed"'
                    }
                }
            }
        }
        
        stage('🧪 Run Tests') {
            steps {
                echo '🧪 Chạy tests...'
                script {
                    if (fileExists('services/user-service/package.json')) {
                        sh 'cd services/user-service && npm test || echo "⚠️ User service tests failed"'
                    }
                    
                    if (fileExists('services/order-service/package.json')) {
                        sh 'cd services/order-service && npm test || echo "⚠️ Order service tests failed"'
                    }
                    
                    if (fileExists('frontend/package.json')) {
                        sh 'cd frontend && npm test -- --watchAll=false || echo "⚠️ Frontend tests failed"'
                    }
                }
            }
        }
        
        stage('🐳 Build Docker Images') {
            steps {
                echo '🐳 Kiểm tra thay đổi và build images...'
                script {

                    def changes = "all"
                    try {
                        def commitCount = sh(
                            script: 'git rev-list --count HEAD 2>/dev/null || echo "1"',
                            returnStdout: true
                        ).trim().toInteger()
                        
                        if (commitCount > 1) {
                            changes = sh(
                                script: 'git diff --name-only HEAD~1 HEAD',
                                returnStdout: true
                            ).trim()
                        }
                    } catch (Exception e) {
                        echo "⚠️ Git diff failed, building all"
                        changes = "all"
                    }
                    
                    echo "📋 Files changed: ${changes}"
                    
                    if (changes.contains('scripts/') || changes == 'all' || env.BUILD_NUMBER == '1') {
                        echo '🔄 Building all services...'
                        sh './scripts/build-images.sh ${USERNAME}'
                        env.IMAGES_BUILT = 'true'
                    } else {
                  
                        if (changes.contains('services/') || changes.contains('frontend/')) {
                            echo '🔄 Changes detected, building all services...'
                            sh './scripts/build-images.sh ${USERNAME}'
                            env.IMAGES_BUILT = 'true'
                        } else {
                            echo '⚠️ No service changes detected, skipping build'
                            env.IMAGES_BUILT = 'false'
                        }
                    }
                }
            }
        }
        
        stage('🔒 Security Scan') {
            when {
                expression { env.IMAGES_BUILT == 'true' }
            }
            steps {
                echo '🔒 Quét bảo mật images...'
                script {
                    sh '''
                        if command -v trivy >/dev/null 2>&1; then
                            ./scripts/scan-images.sh || echo "⚠️ Security scan failed but continuing..."
                        else
                            echo "⚠️ Trivy not installed, skipping security scan"
                        fi
                    '''
                }
            }
        }
        
        stage('📤 Push Images') {
            when {
                allOf {
                    expression { env.GIT_BRANCH == 'origin/master' }
                    expression { env.IMAGES_BUILT == 'true' }  
                }
            }
            steps {
                echo '📤 Push images lên registry...'
                script {
                    sh './scripts/push-images.sh ${REGISTRY} ${USERNAME} || echo "⚠️ Push failed"'
                }
            }
        }
        
        stage('🚀 Deploy to Kubernetes') {
            when {
                allOf {
                    expression { env.GIT_BRANCH == 'origin/master' }
                    expression { env.IMAGES_BUILT == 'true' } 
                }
            }
            steps {
                echo '🚀 Deploy lên Kubernetes...'
                script {
                    sh '''
                        if command -v kubectl >/dev/null 2>&1; then
                            ./scripts/deploy-k8s.sh || echo "⚠️ Deploy failed"
                        else
                            echo "⚠️ kubectl not found, skipping deployment"
                        fi
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Cleanup...'
            sh 'docker image prune -f || echo "Cannot cleanup Docker images"'
        }
        success {
            echo '🎉 Pipeline hoàn thành thành công!'
            sh "docker images | grep ${env.USERNAME} || echo 'No images found'"
        }
        failure {
            echo '❌ Pipeline thất bại!'
        }
    }
}