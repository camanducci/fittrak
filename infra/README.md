## Deployment

This is a rough guideline of steps taken on GCP to bring up the app. Ideally this would be done as
IaC, time permitting.

1. Set up Cloud DNS for `fittrak.ca`
  - This also requires `MX` hookup for Mailgun in order to send mail

2. Create a VPC network and subnet
  - `us-east4`

3. Add a Kubernetes cluster
  - VPC and Subnet from step 2
  - Using Kubernetes v1.10

4. Create Cloud SQL instance
  - Using PostgreSQL v9.6
  - Create the `fittrak` user and db
  - Follow instructions for connecting with k8s: https://cloud.google.com/sql/docs/postgres/connect-kubernetes-engine
    - Create service account
    - Create instance creds secret
    - Create db creds secret
      - This contains the `user` and `pass`

4. Reserve static address
  - `fittrak-ip` should be the name as the annotations in the manifests rely on this
  - Standard tier
  - `us-east4`

5. Init `helm`
  - `helm init`
  - Also need to update perms for default install:
    ```bash
    kubectl create serviceaccount --namespace kube-system tiller
    kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
    kubectl patch deploy --namespace kube-system tiller-deploy -p '{"spec":{"template":{"spec":{"serviceAccount":"tiller"}}}}'
    helm init --service-account tiller --upgrade
    ```

6. Build, tag, and push images to registry
  - Configure gcloud with project (check `gcloud info`) and `gcloud auth configure-docker`
  - Build respective images and tag:
    ```bash
    #For example:

    # Webapp
    docker build -t fittrak-webapp:v1 -f docker/Dockerfile.webapp . --no-cache
    docker tag fittrak-webapp:v1 gcr.io/fittrak-212120/fittrak-webapp:v1
    docker push gcr.io/fittrak-212120/fittrak-webapp:v1

    # Static
    docker build -t fittrak-static:v1 -f docker/Dockerfile.static . --no-cache
    docker tag fittrak-static:v1 gcr.io/fittrak-212120/fittrak-static:v1
    docker push gcr.io/fittrak-212120/fittrak-static:v1
    ```

7. Get SSLcerts and create the secrets
  - Using [sslforfree](https://www.sslforfree.com/)
  - The `crt` and `key` are used in the `fittrak-tls` secret, which the ingress uses for ssl
  - Currently this is not part of the helm chart, investigating how to do this nicely, for now:
  ```bash
  kubectl create secret tls fittrak-tls --key private.key --cert certificate.crt
  ```

8. Install Helm chart (Deploy)
  - Update kubectl context to the prod kubernetes cluster
  - Run the helm install command overriding required values:
  ```bash
  # For example:
  helm install ./fittrak \
    --set foo=bar \
    --set baz=bat
  ```
