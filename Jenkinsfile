#!/usr/bin/groovy

def branch = "${BRANCH_NAME.toLowerCase()}"
def web_name = "labbox_web:${branch}"

pipeline {
  agent {
    kubernetes {
      yaml """
        spec:
          nodeSelector:
            kubernetes.io/hostname: k8s-node-1
          containers:
            - name: docker
              image: docker:18.06
              command: ['cat']
              tty: true
              volumeMounts:
                - name: dockersock
                  mountPath: /var/run/docker.sock
            - name: node
              image: node:14-alpine
              command: ['cat']
              tty: true
            - name: kubectl
              image: bitnami/kubectl:1.17.3
              command: ['cat']
              tty: true
              securityContext:
                runAsUser: 0
              volumeMounts:
                - name: kubeconfig
                  mountPath: /root/.kube/config
          volumes:
          - name: dockersock
            hostPath:
              path: /var/run/docker.sock
          - name: kubeconfig
            hostPath:
              path: /root/.kube/config
      """
    }
  }
  stages {
    // stage('Test') {
    //   // https://stackoverflow.com/questions/42743201/npm-install-fails-in-jenkins-pipeline-in-docker/42957034
    //   environment {
    //     HOME = '.'
    //   }
    //   steps {
    //     container('node') {
    //       sh "npm ci"
    //       sh "npm run lint"
    //       sh "npm audit || true"
    //       sh "npm run test:ci"
    //     }
    //   }
    // }
    stage('Configure Staging') {
      steps {
        sh """
          cd touch .env.production && \
            cp .env.staging .env.production
        """
      }
    }
    stage('Build') {
      steps {
        container('docker') {
          sh """
            cd next && 
            docker build \
              --label lastingdynamics.commit=${GIT_COMMIT} \
              --label "timestamp=${BUILD_TIMESTAMP}" \
              -t ${web_name} \
              -f ./Dockerfile .
          """
        }
      }
    }
    stage('Deploy') {
      steps {
        container('kubectl') {
          sh "kubectl delete pods -l app=labbox-ephys tier=web -n labbox"
        }
      }
    }
  }

  post {
    always {
      deleteDir()
    }
  }
}
