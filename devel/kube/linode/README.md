# Deploying to linode

## Create a linode account

First create a [linode](https://www.linode.com/) account and log in.

## Create a kubernetes cluster

From linode->Kubernetes, select "Create a Cluster"

Enter a cluster label, region, and the most recent kubernetes version

Add a node pool (for example Linode 16GB). At least 3 nodes are recommended in the pool, but you can start with 1 to save some $ during development.

Click "Create cluster"

## Install kubectl locally

The kubectl command-line tool allows you to manage your kubernetes deployments from your local machine. See https://kubernetes.io/docs/tasks/tools/install-kubectl/

## Download the kubeconfig

In order to interact with your cluster, you must download the kubeconfig file. Click on linode->Kubernetes, find your cluster and click "Download kubeconfig". Save this file somewhere safe on your computer (I put it in the ~/.kube directory). You can either use the KUBECONFIG environment variable to point to the location of this file, or you can just copy it to do the default location of ~/.kube/config.

Now test to see if you are connected to your cluster:

```bash
kubectl get all
```

## Start the load balancer service

Make sure you are in this working directory

```bash
kubectl apply -f service.yml
```

Now check to see that the LoadBalancer service is active

```bash
kubectl get service
```

## Create the persistent volume

Make sure you are in this working directory

```bash
kubectl apply -f pvc.yml
```

Now check to see that the pvc is active

```bash
kubectl get pvc
```

## Start the deployment

Make a copy of the deployment.yml file

```
cp deployment.yml deployment.1.yml
```

and fill in the `xxxxxx` as appropriate (more details needed).

Start the deployment:

```bash
kubectl apply -f deployment.1.yml
```

And view the status:

```bash
kubectl get pod
```

View the server logs:

```bash
kubectl logs <pod-name> --follow
```

Restart the server:

```bash
kubectl delete pod <pod-name>
```
