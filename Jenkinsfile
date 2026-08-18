pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    environment {
        IMAGE_NAME = 'chetima/user-app'
        IMAGE_TAG  = "${BUILD_NUMBER}"
    }

    options {
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Install Dependencies') {
            steps {
                echo "===== Installing Dependencies ====="
                sh 'node --version'
                sh 'npm --version'
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    echo '===== SONARQUBE ANALYSIS ====='
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Docker Login & Push') {
            steps {
                echo '===== PUSHING TO DOCKER HUB ====='
                withCredentials([
                    usernamePassword(
                        credentialsId: 'Docker-hub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh 'echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin'
                    sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Production Approval') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to production?'
            }
        }

        stage('Deploy Production') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    kubectl set image deployment/user-app user-app=${IMAGE_NAME}:${IMAGE_TAG} -n personal-project
                    kubectl rollout status deployment/user-app -n personal-project
                """
            }
        }

        stage('Verify Deployment') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    kubectl get deployment/user-app -n personal-project
                    kubectl get pods -n personal-project -l app=user-app
                """
            }
        }
    }

    post {
        success {
            echo '======================================'
            echo '     CI/CD PIPELINE SUCCESSFUL!       '
            echo '======================================'
            echo "Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo '======================================'
            echo '       CI/CD PIPELINE FAILED!         '
            echo '======================================'
        }
        always {
            echo "Build #${BUILD_NUMBER} finished."
        }
    }
}