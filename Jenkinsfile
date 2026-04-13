pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'capshop'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build .NET Services') {
            steps {
                bat 'dotnet build CapShop.sln'
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend\\capshop-client') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Docker Compose Build') {
            steps {
                bat 'docker compose build'
            }
        }

        stage('Docker Compose Up') {
            steps {
                bat 'docker compose up -d'
            }
        }

        stage('Show Running Containers') {
            steps {
                bat 'docker ps'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'CapShop CI/CD pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check console output.'
        }
    }
}