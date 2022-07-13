REGION=$1
STAGE=$2

# Exit when any command fails
set -e

# Check if docker is running
docker info

if [ $STAGE = "production" ] || [ $STAGE = "demo" ] || [ $STAGE = "rbc" ]
then
while true; do
    read -p "You are about to deploy belenios-api in $STAGE. Do you want to continue ? [y/n]" yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done
fi

if [ $STAGE = "production" ] || [ $STAGE = "rbc" ]
then
while true; do
    read -p "Really ? [y/n]" yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done
fi

yarn serverless deploy --stage $STAGE --region $REGION
